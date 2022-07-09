import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar';
import {Link, useParams} from 'react-router-dom'
import moment from 'moment'
import * as nearApi from 'near-api-js'
import {useNavigate} from 'react-router-dom'

function Me(props) {
    const [proposals, setProposals] = useState([])
    const [page, setPage] = useState(0)
    const navigate = useNavigate()
    useEffect(() => {
        try {
            window.contract.get_proposals_by_account_id({account_id: window.accountId, from: page.toString(), limit: 100}).then(result => {
                const proposals = result.map(proposal => {
                    return {
                        id: proposal[0],
                        ...proposal[1]
                    }
                })
                setProposals(proposals)
            })
        } catch (e) {
            console.log(e)
        }
    }, [])

    const claim = (id) => {
        console.log(id)
        window.contract.claim_proposal(
            {proposal_id: id},
            10000000000000,
            "1"
        ).then(() => navigate('/me'))
    }

    return (
        <div>
            <Navbar />
            <div className='mt120 container'>
            <div className='mb-5 d-flex justify-content-around'>
                {proposals.map((proposal, index) => {
                    return (
                        <div className="card"  style={{width: "22rem"}} key={index}>
                            <img className="card-img-top" src={proposal.images[0]} alt="Card image cap" />
                            <div className="card-body">
                                <h5 className="card-title" onClick={() => navigate(`/proposals/${proposal.id}`)}><a href='#'>{proposal.title} #{proposal.id}</a></h5>
                                <p className="card-text">{proposal.description}</p>
                                <p className="card-text">created at {moment(proposal.created_at / 10**6 ).format('mm/DD/yyyy HH:mm')}</p>
                                <p className="card-text">total donated: {nearApi.utils.format.formatNearAmount(proposal.total)}, claimed: {nearApi.utils.format.formatNearAmount(proposal.claimed)}</p>
                                <button className="btn btn-primary" onClick={() => claim(proposal.id)}>Claim</button>
                            </div>
                        </div>
                    )
                })}
            </div>
            </div>
        </div>
    );
}

export default Me;