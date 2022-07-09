use std::collections::HashMap;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::env::STORAGE_PRICE_PER_BYTE;
use near_sdk::json_types::{U64, U128};
use near_sdk::{env, near_bindgen, Balance, AccountId, Promise, BorshStorageKey, PanicOnDefault};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::collections::{UnorderedMap};

const ONE_NEAR_ES_YOCTO: Balance = 1_000_000_000_000_000_000_000_000;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    proposals: UnorderedMap<u64, Proposal>,
    proposal_id_serial: u64,
    owner: AccountId,
    proposals_by_account_id: UnorderedMap<AccountId, Vec<u64>>
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    Proposal,
    ProposalsByAccountId
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Proposal {
    title: String,
    description: String,
    donation: HashMap<AccountId, Balance>,
    images: Vec<String>,
    created_at: u64,
    proposer: AccountId,
    total: Balance,
    claimed: Balance
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ProposalInput {
    title: String,
    description: String,
    images: Vec<String>
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ProposalOutput {
    title: String,
    description: String,
    created_at: u64,
    proposer: AccountId,
    total: U128,
    claimed: U128,
    images: Vec<String>
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ProposalOutputDetail {
    title: String,
    description: String,
    created_at: u64,
    proposer: AccountId,
    total: U128,
    claimed: U128,
    images: Vec<String>,
    donation: HashMap<AccountId, U128>
}

#[near_bindgen]
impl Contract {

    #[init]
    pub fn new(owner: AccountId) -> Self {
        Self {
            proposals: UnorderedMap::new(StorageKey::Proposal),
            proposal_id_serial: 0u64,
            owner,
            proposals_by_account_id: UnorderedMap::new(StorageKey::ProposalsByAccountId)
        }
    }

    #[private]
    #[init(ignore_state)]
    pub fn migrate() -> Self {
        let this: Self = env::state_read().expect("Cannot deserialize");
        Self {
            proposals: UnorderedMap::new(StorageKey::Proposal),
            proposal_id_serial: 0u64,
            owner: this.owner,
            proposals_by_account_id: UnorderedMap::new(StorageKey::ProposalsByAccountId)
        }
    }

    #[payable]
    pub fn create_proposal(&mut self, proposal_input: ProposalInput) -> Promise {
        let initial_storage_usage = env::storage_usage();
        let proposer = env::predecessor_account_id();
        self.proposal_id_serial += 1;
        let proposal_id = self.proposal_id_serial;
        let proposal = Proposal {
            donation: HashMap::new(),
            proposer: proposer.to_owned(),
            total: Balance::from(0u128),
            images: proposal_input.images,
            claimed: Balance::from(0u128),
            title: proposal_input.title,
            description: proposal_input.description,
            created_at: env::block_timestamp(),
        };
        self.proposals.insert(&proposal_id, &proposal);
        
        let proposals_by_account_id = if let Some(mut proposals) = self.proposals_by_account_id.get(&proposer) {
            proposals.push(proposal_id.clone());
            proposals
        } else {
            let mut new_proposals_by_account_id = Vec::new();
            new_proposals_by_account_id.push(proposal_id.clone());
            new_proposals_by_account_id
        };
        self.proposals_by_account_id.insert(&proposer, &proposals_by_account_id);
        let required_storage_in_bytes = env::storage_usage() - initial_storage_usage;

        let attached_deposit = env::attached_deposit();

        let refund_value = attached_deposit - Balance::from(required_storage_in_bytes) * STORAGE_PRICE_PER_BYTE;

        Promise::new(proposer).transfer(refund_value)
    }

    #[payable]
    pub fn donate_proposal(&mut self, proposal_id: U64) {
        let proposal_id_serial = proposal_id.0;
        let account_id = env::predecessor_account_id();
        let attached_deposit = env::attached_deposit();
        
        let mut proposal = &mut self.proposals.get(&proposal_id_serial.clone()).expect("Proposal not found");
        
        let account_donated = proposal.donation.get(&account_id).unwrap_or(&0u128);
        
        let new_account_donated = account_donated + attached_deposit;
        
        proposal.donation.insert(account_id, new_account_donated);
        proposal.total += attached_deposit;
        
        self.proposals.insert(&proposal_id_serial, &proposal);
    }

    pub fn get_proposals(&self, from: U128, limit: u64) -> Vec<(U64, ProposalOutput)> {
        self.proposals
            .keys()
            .skip(from.0 as usize)
            .take(limit as usize)
            .map(|proposal_id| {
                let proposal = self.proposals.get(&proposal_id).unwrap();
                (U64::from(proposal_id) ,ProposalOutput {
                    title: proposal.title,
                    description: proposal.description,
                    created_at: proposal.created_at,
                    proposer: proposal.proposer,
                    total: U128::from(proposal.total),
                    claimed: U128::from(proposal.claimed),
                    images: proposal.images,
                })
            })
            .collect()
    }

    pub fn get_proposals_by_account_id(&self, account_id: AccountId, from: U128, limit: u64) -> Vec<(U64, ProposalOutput)> {
        let proposals = self.proposals_by_account_id.get(&account_id).unwrap_or(Vec::new());
        proposals
            .iter()
            .skip(from.0 as usize)
            .take(limit as usize)
            .map(|proposal_id| {
                let proposal = self.proposals.get(&proposal_id).unwrap();
                (U64::from(proposal_id.clone()) , ProposalOutput {
                    title: proposal.title,
                    description: proposal.description,
                    created_at: proposal.created_at,
                    proposer: proposal.proposer,
                    total: U128::from(proposal.total),
                    claimed: U128::from(proposal.claimed),
                    images: proposal.images,
                })
            })
            .collect()
    }

    pub fn get_proposal_detail(&self, proposal_id: U64) -> Option<ProposalOutputDetail> {
        match self.proposals.get(&proposal_id.0) {
            Some(proposal) => {
                let donation = proposal.donation;
                let mut donation_formatted = HashMap::new();
                for (key, value) in donation {
                    donation_formatted.insert(key, U128::from(value));
                };
                Some(ProposalOutputDetail {
                    title: proposal.title,
                    description: proposal.description,
                    created_at: proposal.created_at,
                    proposer: proposal.proposer,
                    total: U128::from(proposal.total),
                    claimed: U128::from(proposal.claimed),
                    images: proposal.images,
                    donation: donation_formatted
                })
            },
            None => None,
        }
    }

    #[payable]
    pub fn claim_proposal(&mut self, proposal_id: U64) -> Promise {
        let attached_deposit = env::attached_deposit();
        assert_eq!(attached_deposit, 1);
        let proposal_id_serial = proposal_id.0;

        let account_id = env::predecessor_account_id();
        
        let proposal = &mut self.proposals.get(&proposal_id_serial).expect("Proposal not found"); 
        assert_eq!(&account_id, &proposal.proposer, "Only proposer");
        let claimable = proposal.total - proposal.claimed;
        proposal.claimed = proposal.total;
        self.proposals.insert(&proposal_id.0, proposal);
        Promise::new(account_id).transfer(claimable)
    }
}