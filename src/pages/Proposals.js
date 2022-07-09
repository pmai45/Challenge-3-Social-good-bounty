import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar';
import {useNavigate} from 'react-router-dom'
import moment from 'moment'

function Proposals(props) {

    const navigate = useNavigate()
    const [proposals, setProposals] = useState([])
    const [page, setPage] = useState(0)
    useEffect(() => {
        window.contract.get_proposals({
            from: page.toString(), limit: 100
        }).then(result => {
            const proposalsList = result.map(proposal => {
                return {id: proposal[0], ...proposal[1]}
            } )
            setProposals(proposalsList)
        })
    }, [])
    return (
        <>
        <Navbar />
        <div className='proposals container mt120'>
            <div className='header mt-5'>
                <h1>
                    Some animals need your help
                </h1>
                <p>
                    Anyone from any area could create a proposal to help some animals and post it on this website, you could send them money to help these animals go through their situation.
                </p>
            </div>
            <div className='mb-5 d-flex justify-content-around'>
                {proposals.map((proposal, index) => {
                    return (
                        <div className="card"  style={{width: "22rem"}} key={index} onClick={() => navigate(`/proposals/${proposal.id}`)}>
                            <img className="card-img-top" src={proposal.images[0]} alt="Card image cap" />
                            <div className="card-body">
                                <h5 className="card-title">{proposal.title}</h5>
                                <p className="card-text">{proposal.description}</p>
                                <p className="card-text">{proposal.proposer} at {moment(proposal.created_at / 10**6 ).format('mm/DD/yyyy HH:mm')}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
        </>
    );
}

export default Proposals;