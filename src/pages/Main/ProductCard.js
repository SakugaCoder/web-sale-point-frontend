import styled from "styled-components";

const ProductCardStyled = styled.div`
    border: solid 1px #CFDFE3 ;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    padding: 5px;
    transition: all ease 0.2s;
    &:hover{
        border-color: #000;
        cursor: pointer;
    }
`;

const ProductCardImage = styled.img`
    max-width: 70%;
    margin: auto;
`;

const ProductCardPrice = styled.div`
    font-weight: 800;
    font-size: 16px;
    text-align: center;
    margin-top: 5px;
`;

export default function ProductCard(props){
    return(
        <ProductCardStyled onClick={ () => props.handleOnClick(props) }>
            <ProductCardImage src={props.img} />
            <ProductCardPrice>
                $ { props.price }
            </ProductCardPrice>
        </ProductCardStyled>
    );
}