import styled from "styled-components";

const UserPictureContainer = styled.div`
    width: 100px;
    height: 100px;
    background-color: white;
    border: solid 1px #000;
    border-radius: 100px;
    display: flex;

    &:hover{
        cursor: pointer;
    }
    
    p{
        margin: auto;
        font-size: 30px;
        font-weight: 600;
    }
`;

export default function UserPicture(props){
    return(
        <UserPictureContainer>
            <p>DF</p>
        </UserPictureContainer>
    );
}