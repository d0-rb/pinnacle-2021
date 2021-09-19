import React from 'react'
import styled from 'styled-components'
import PostViewer from './PostViewer'
import MenuView from './MenuView'
import RecommendedUsersView from './RecommendedUsersView'

const Wrapper = styled.div`
    height: 100vh;
    width: 100vw;
    background-color: #fafafa;
    padding: 100px;
    padding-left: 300px;
    padding-right: 300px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    @media screen and (max-width: 1250px) {
        padding-left: 150px;
        padding-right: 150px;
    }
`

const SideColumn = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
`

export default function MainView(props) {


    return (
        <Wrapper>
            <PostViewer />
            <SideColumn>
                <MenuView />
                <RecommendedUsersView></RecommendedUsersView>
            </SideColumn>
        </Wrapper>
    )
}
