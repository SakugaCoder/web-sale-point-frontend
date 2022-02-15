import Layout from "../../components/Layout.";
import Button from "../../components/Button";
import UserPicture from "../../components/UserPicture";
import ProductCard from "./ProductCard";

import styled from 'styled-components';
import { useState } from "react";

import Ticket from "../../components/Ticket";
import Modal from "../../components/Modal/Modal";

import useModal from "../../hooks/useModal";


const MainContainer = styled.div`
    margin: 20px;
    heigth: 100vh;
`;

const Header = styled.header` 
    display: flex;
    justify-content: space-between;
`;

const CustomerStatus = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 60%;
`;

const CustomerData = styled.div`
    border: 2px solid #000;
    border-radius: 20px;
    padding: 5px;
    max-width: 350px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const CustomerDataItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    & > p{
        width: 40%;
    }

    & > strong{
        width: 40%;
    }
`;

const ProductContainer = styled.div`
    display: flex;
`;

const ProductLeftSide = styled.div`
    width: 60%;
    display: flex;
    flex-direction: column;
`;

const ProductList = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    max-width: 100%;
    margin-top: 20px;
    max-height: 60vh;
    overflow-y: scroll;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
`;


export default function Main(){
    let [products, setProducts] = useState([
        {
            name: 'manzana',
            price: '23',
            img: './images/apple.jpeg'
        },
        {
            name: 'manzana',
            price: '23',
            img: './images/apple.jpeg'
        },
        {
            name: 'manzana',
            price: '23',
            img: './images/apple.jpeg'
        },
        {
            name: 'manzana',
            price: '23',
            img: './images/apple.jpeg'
        },
        {
            name: 'manzana',
            price: '23',
            img: './images/apple.jpeg'
        }
    ]);

    let [basket, setBasket] = useState([
        {
            name: 'manzana',
            price: '23',
            img: './images/apple.jpeg',
            kg: 1
        },
        {
            name: 'manzana',
            price: '23',
            img: './images/apple.jpeg',
            kg: .800
        },
        {
            name: 'manzana',
            price: '23',
            img: './images/apple.jpeg',
            kg: 2.3
        }
    ]);

    const { modalState, setModalState, handleModalClose } = useModal();
    const modalContent = item_data => {
        <div>Hello</div>

        
    }

    const openProductModal = product_data => {
        setModalState({...modalState, visible: true});
    };

    return(
        <Layout>
            <MainContainer>
                <Header>
                    <CustomerStatus>
                        <CustomerData>
                            <CustomerDataItem>
                                <strong>Cliente:</strong>
                                <p>Juan Perez</p>
                            </CustomerDataItem>

                            <CustomerDataItem>
                                <strong>Deuda:</strong>
                                <p>$0.00</p>
                            </CustomerDataItem>

                        </CustomerData>

                        <Button className="bg-primary">SELECCIONAR CLIENTE</Button>
                    </CustomerStatus>

                    <UserPicture />    
                </Header>


                <ProductContainer>
                    <ProductLeftSide>
                        <ProductList>
                            { products.map( product => <ProductCard handleOnClick={ () => openProductModal(product) } img={ product.img } price={ product.price } /> )}
                        </ProductList>

                        <ButtonGroup>
                            <Button color={'red'} className="bg-red lg-p">FIAR PEDIDO</Button>
                            <Button color={'blue'} className="bg-blue lg-p">TICKET</Button>
                            <Button color={'black'} className="bg-black lg-p">PAGO</Button>
                        </ButtonGroup>
                    </ProductLeftSide>

                    <Ticket items={ basket } />
                </ProductContainer>
            </MainContainer>

            <Modal title='Mi titulo' visible={ modalState.visible }  handleModalClose={  handleModalClose } >
                HOLA
            </Modal>
        </Layout>
    );
}