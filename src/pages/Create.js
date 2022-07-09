import React, {useState} from 'react';
import cat from '../assets/cat.png'
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'
import {utils} from 'near-api-js'
import Navbar from '../components/Navbar';
import { login } from '../utils';

const web3StorageToken  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGRhMjM1MDYwZUVkNWZBOERFMjlFMjAwN2QwNDkzMEExNGE1ZEZhNjgiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTQ0MTMyMzE4MjIsIm5hbWUiOiJwbWFpX3dlYjMifQ.YnV8Y1E9WxN1IBUGJkhBL4NunvtahIeowCWNZ7F_zt0"

const Create = () => {
    let [title, setTitle] = useState()
    let [description, setDescription] = useState()
    let [images, setImages] = useState([])

    const handleSubmit = () => {
        if (!window.walletConnection.isSignedIn()) {
            return login()
        } 
        let imagesFilter = [...images].filter(image => image?.type?.includes('image'))
        if (!title || !description || !imagesFilter) {
            alert('Please fill out the form')
        }
        const client = new Web3Storage({ token: web3StorageToken })
        console.log(imagesFilter)
        client.put(imagesFilter).then(cid => {
            let imagesIpfs = imagesFilter.map(image => `https://dweb.link/ipfs/${cid}/${image.name}`)
            window.contract.create_proposal({
                proposal_input: {
                    title,
                    description,
                    images: imagesIpfs
                } 
            },
            10000000000000, 
            utils.format.parseNearAmount("0.1")
            )
        })
    }

    return (
        <>
        <Navbar />
        <div className="create-form mt120">
            <div className='logo-image'>
                <img src={cat} />
            </div>
            <p style={{textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem'}}>
                One proposal to save animals
            </p>
            <div className="input-group input-group mb-3">
                <input type="text" className="form-control" placeholder="Your proposal" onChange={(e) => setTitle(e.target.value)}/>
            </div>
            <div className="input-group input-group mb-3">
                <textarea type="text" className="form-control" placeholder="Write some description" rows="4" onChange={(e) => setDescription(e.target.value)}/>
            </div>
            <div className="input-group input-group mb-3">
                <input className="form-control" type="file" id="formFile" accept="image/*" multiple onChange={(e) => setImages(e.target.files)}/>
            </div>
            <div className="d-grid gap-2">
                <button className="btn btn-dark" type="button" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
        </>
    );
};

export default Create;