import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar';
import HeroImage from '../assets/kitten.png'
import {useNavigate} from 'react-router-dom'

function Home() {

    const navigate = useNavigate()
    

    return (
        <>
            <Navbar />
            <div className='hero-section d-flex justify-content-between'>
                <div className='hero-section-content d-flex flex-column justify-content-center'>
                    <h1>
                        Save animals!
                    </h1>
                    <p>
                        Save animals by a decentralized network
                    </p>
                    <div className='d-flex mt-3 mx-5'>
                        <div className='hero-section-action mx-4'>
                            <button className='btn btn-dark btn-lg' onClick={() => navigate('/create')}>Create Proposals</button>
                        </div>
                        <div className='hero-section-action'>
                            <button className='btn btn-light btn-lg' onClick={() => navigate('/proposals')}>See Proposals</button>
                        </div>
                    </div>
                </div>
                <div className='hero-section-image'>
                    <div>
                        <img src={HeroImage} alt="" />
                    </div>
                </div>
            </div>
            <div className=''></div>
        </>
    );
}

export default Home;