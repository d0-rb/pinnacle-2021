import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import UploadIcon from '@mui/icons-material/Upload'
import PhotoAlbumIcon from '@mui/icons-material/PhotoAlbum'
import DeleteIcon from '@mui/icons-material/Delete'
import { store } from '../redux/redux'
import Dialog from '@mui/material/Dialog';


const Wrapper = styled.div`
    height: 10%;
    margin-bottom: 10px;
    width: 100%;
    background-color: white;
    border: 1px solid #dbdbdb;
    border-radius: 3px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    @media screen and (max-width: 1250px) {
        min-width: 200px;
    }
`

const DialogInnerContainer = styled.div`
    height: 800px;
    width: 1200px;
    background-color: white;
    display: flex;
    flex-direction: column;
`

const HeaderContainer = styled.div`
    height: 150px; 
    width: 100%;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: row;
`

const Header = styled.h2`
    margin: 0;
    padding: 0;
    margin-bottom: 5px;
`

const GridView = styled.div`
    display: grid;
    height: 100%;
    max-width: 1200px;
    grid-template-columns: 1fr 1fr 1fr;
    grid-auto-rows: min-content;
    column-gap: 10px;
    row-gap: 10px;
    padding-left: 20px;
    padding-right: 20px;
`

const UserPostWrapper = styled.div`
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.1);
    position: relative;
    border-radius: 5px;
`

const UserPostDelete = styled.div`
    display: flex;
    position: absolute;
    justify-content: center;
    align-items: center;
    top: -5px;
    right: -5px;
    height: 25px;
    width: 25px;
    border-radius: 13px;
    background-color: #FF6961;
    transition: height 0.2s ease, width 0.2s ease;
    z-index: 10;
    cursor: pointer;

    :hover {
        height: 27px;
        width: 27px;
    }
`

const UserImage = styled.img`
    max-width: 100%;
`

function UserPost(props) {
    const { backgroundImage, removePost, imgId } = props.userPost;

    function deleteOnClick() {
        removePost();
        fetch("http://192.168.162.63:5000/delete_image", {
            method: "POST",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                img_uuid: imgId,
            })
        }).then((res) => res.json())
        .then((json) => {
        }, e => console.log(e))
    }

    return (
        <UserPostWrapper>
            <UserPostDelete onClick={deleteOnClick}><DeleteIcon style={{fontSize: "14px", color: "white"}}/></UserPostDelete>
            <UserImage alt="Random" src={`data:image/jpeg;base64, ${backgroundImage}`}></UserImage>
        </UserPostWrapper>
    )
}

export default function MenuView() {
    const [modalOpen, setModalStatus] = useState(false);
    const [posts, setUserPosts] = useState([]);

    function populateUserPhotos() {
        fetch("http://192.168.162.63:5000/get_user_images", {
            method: "POST",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                uuid: store.getState().auth.user,
            })
        }).then((res) => res.json())
        .then((json) => {
            if (json.result) setUserPosts(json.result);
            else console.error("Error with user result", json.result);
        }, console.log)
    }

    useEffect(() => {
        populateUserPhotos();
    }, [])

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    async function handleUploadModal(e) {
        if (e.target.files && e.target.files.length > 0) {
            let result = await toBase64(e.target.files[0]).catch(e => Error(e));
            if(result instanceof Error) {
               console.log('Error: ', result.message);
               return;
            }

            let remove = result.indexOf(",");
            result = result.substring(remove + 1);

            fetch("http://192.168.162.63:5000/upload_image", {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    uuid: store.getState().auth.user,
                    image: result
                })
            }).then((res) => res.json())
            .then((json) => {
                console.log('Successfully added image: ', json)
            }, console.log)
        }
    }   

    function toggleUserPhotosModal() {
        if (!modalOpen) populateUserPhotos();
        setModalStatus(!modalOpen);
    }

    return (
        <Wrapper>
            <label>
                <input type="file" name="file" onChange={handleUploadModal} hidden></input>
                <span><UploadIcon onClick={handleUploadModal} style={{color: "rgba(0,0,0,0.5)"}}></UploadIcon></span>
            </label>
            <>
                <PhotoAlbumIcon onClick={toggleUserPhotosModal} style={{color: "rgba(0,0,0,0.5)", fontSize: "20px", marginBottom: "5px", marginLeft: "20px"}}></PhotoAlbumIcon>
                <Dialog  maxWidth="l" style={{height: "100%", width: "100%"}} open={modalOpen} onClose={toggleUserPhotosModal}>
                    <DialogInnerContainer>
                        <HeaderContainer>
                            <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                                <Header>Posts</Header>
                                <div style={{height: "1px", width: "70px", backgroundColor: "rgba(0,0,0,0.5)"}}></div>
                            </div>
                        </HeaderContainer>
                        <GridView>
                            {
                                posts.map(post => {
                                    let userPost = {
                                        backgroundImage: post.image,
                                        removePost: () => {
                                            setUserPosts(posts.filter(fPost => fPost !== post))
                                        },
                                        imgId: post.img_uuid
                                    }
                                    return <UserPost userPost={userPost}/>
                                })
                            }
                        </GridView>
                    </DialogInnerContainer>
                </Dialog>
            </>
        </Wrapper>
    )
}

