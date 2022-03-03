import styled from 'styled-components';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
    width: 100%;
    display: flex;
    
`;

const MainContainer = styled.div`
    width: 100%;
    padding-left: 280px;
`;

export default function Layout(props){

    let session = localStorage.getItem('session-started');
    if(!session){
        window.location.assign('/');
    }

    return(
        <LayoutContainer>
            <Sidebar active={props.active} />
            <MainContainer>
                { props.children }
            </MainContainer>
        </LayoutContainer>
    );
}