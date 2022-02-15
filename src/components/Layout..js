import styled from 'styled-components';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
    width: 100%;
    display: flex;
`;

const MainContainer = styled.div`
    width: 100%;
`;

export default function Layout(props){
    return(
        <LayoutContainer>
            <Sidebar />
            <MainContainer>
                { props.children }
            </MainContainer>
        </LayoutContainer>
    );
}