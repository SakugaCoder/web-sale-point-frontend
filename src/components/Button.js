import styled from "styled-components";


const primary_color = '#26C485';


const StyledButton = styled.button`
    display: block;
    border: solid 1px transparent;
    border-radius: 20px;
    font-weight: 700;
    font-size: 18px;

    &:hover{
        cursor: pointer;
        background-color: white;
        border-color: #000;
    }

    ${ props => props.big ? 'padding: 20px 15px;' : '    padding: 20px 15px;'}
`;

export default StyledButton;
