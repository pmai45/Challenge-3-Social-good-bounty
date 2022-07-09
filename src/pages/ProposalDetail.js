import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar';
import {useParams} from 'react-router-dom'
import moment from 'moment'
import * as nearApi from 'near-api-js'

function ProposalDetail(props) {
    const {id} = useParams()
    console.log(id)
    const [proposal, setProposal] = useState()
    const [donateBalance, setDonateBalance] = useState()
    useEffect(() => {
        try {
            window.contract.get_proposal_detail({proposal_id: id}).then(result => {
                console.log(result)
                setProposal(result)
            })
        } catch (e) {
            console.log(e)
        }
    }, [])
    
    const onSubmit = () => {
        if (parseFloat(donateBalance) > 0) {
            window.contract.donate_proposal(
                {proposal_id: id},
                10000000000000, 
                nearApi.utils.format.parseNearAmount(donateBalance)
            )
        } else {
            alert("Invalid donate balance")
        }
    }

    return (
        <>
        <Navbar />
        <div className='mt120 container'>
            <div className='header'>
                <h1>Proposal #{id}: {proposal?.title}</h1>
                <p className="text-center">propose by {proposal?.proposer} at {proposal?.created_at && moment(proposal?.created_at / 10**6 ).format('mm/DD/yyyy HH:mm')}</p>
            </div>
            <div className='d-flex justify-content-center proposal-image'>
                <img src={proposal?.images[0]} />
            </div>
            <div style={{maxWidth: "60%", marginLeft: "auto", marginRight: "auto"}}>
                <p style={{textAlign: "center"}}>{proposal?.description}</p>
            </div>
            <div className="input-group mb-3" style={{maxWidth: "40%", marginLeft: "auto", marginRight: "auto"}}>
                <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Enter donate balance (NEAR)" 
                    onChange={(e) => setDonateBalance(e.target.value)}
                />
                <div className="input-group-append">
                    <button onClick={onSubmit} className="btn btn-outline-secondary" type="button">Button</button>
                </div>
            </div>
            
            <div className='mt-3' style={{maxWidth: "60%", marginLeft: "auto", marginRight: "auto"}}>
                <h3>People donated:</h3>
                <div>
                    {proposal?.donation && Object.keys(proposal.donation).map(key => {
                        return (
                            <div>
                                <h4>{key}: {nearApi.utils.format.formatNearAmount(proposal.donation[key])} NEAR</h4>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
        </>
    );
}

export default ProposalDetail;