import Layout from "../../components/Layout.";
import Button from "../../components/Button";
import UserPicture from "../../components/UserPicture";
import ProductCard from "./ProductCard";

import styled from 'styled-components';
import { useEffect, useState } from "react";

import Ticket from "../../components/Ticket";
import Modal from "../../components/Modal/Modal";

import useModal from "../../hooks/useModal";
import Input from "../../components/Input/Input";
import { getItems, insertItem } from "../../utils/SPAPPI";
import { getTotal } from "../../utils/Operations";

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

    & select{
        padding: 10px 15px;
        font-size: 18px;
        border-radius: 40px;
    }

    select::-ms-expand {
        display: none;
    }
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

const ProductCardModal = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    & img{
        margin: auto;
        max-width: 200px;
    }

    & strong{
        text-align: center;
        font-size: 20px;
        margin-bottom: 20px;
    }
`;

const ModalForm = styled.form`
    width: 90%;

    & label{
        display: block;
        max-width: 100%;
    }

    & label input{
        width: 100%;
        font-size: 18px;
        margin-bottom: 40px;
    }
`;

const ModalButtons = styled.div`
    display: flex;
    justify-content: space-between;

    & button{
        width: 45%;
    }
`;


export default function Main(){
    let [products, setProducts] = useState([]);
    let [clients, setClients] = useState([]);
    let [currentClient, setCurrentClient] = useState(null);
    let [basket, setBasket] = useState([]);
    const { modalState, setModalState, handleModalClose } = useModal();

    const getProducts = async () => {
        let products = await getItems('Productos');
        setProducts(products);
        console.log(products);
    }

    const getClients = async () => {
        let products = await getItems('Clientes');
        setClients(products);
        console.log(products);
    }

    const onChangeSelect = evt => {
        if(evt.target.value){
            let client_data = evt.target.value.split(',');
            setCurrentClient({id: client_data[0], name: client_data[1], debt: client_data[2]})
        }
        else{
            setCurrentClient(null);
        }    
    }

    function completeLine(text){
        let new_text = text;
        for(let i = 0; i < (31 - (text.length)) ; i++){
            new_text += ' ';
        }

        return new_text;
    }

    function addLineBreak(){
        let line_break = '';
        for(let i=0; i < 32; i++)
            line_break += ' ';
        return line_break;
    }

    function printPageArea(){
        var printContent = document.getElementById('ticket-content');
        var WinPrint = window.open('', '', 'width=900,height='+printContent.clientHeight);
        let date = completeLine(new Date().toISOString().split(':')[0]);
        let client = completeLine(`Cliente: ${currentClient.name}`);

        WinPrint.document.writeln(date);
        // WinPrint.document.write(addLineBreak());
        WinPrint.document.writeln(client);
        // WinPrint.document.write(addLineBreak());
        WinPrint.document.write(printContent.innerHTML);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    }

    useEffect( () => {
        getProducts();
        getClients();
    }, []);




    const clearBasket = () => setBasket([]);

    const payOrder = async (evt) => {
        evt.preventDefault();
        let payment = Number(evt.target.pago.value);
        if(getTotal(basket) <= payment ){
            let order = {
                total: Number(getTotal(basket)),
                payment,
                items: basket,
                client: currentClient,
                date:  (new Date().toISOString().split(':')[0]).split('T')[0]
            }

            let res = await insertItem('pedido', order);
            if(res.err === false){
                window.location.reload();
            }
            console.log(res);
            console.log(order);
            handleModalClose();
        }

        else{
            alert('Error al procesar el pago. Favor de especificar una cantidad mayor o igual al total');
        }
        
    }
    const addProductToBasket = (evt, item_data) => {
        evt.preventDefault();
        let kg = Number(evt.target.kg.value);
        if(kg > 0){
            item_data.kg = kg;
            setBasket([...basket, item_data])
            handleModalClose();
            return null;
        }
        alert('Favor de especificar la cantidad');
    };

    const modalContent = item_data => {
        return <ProductCardModal>
            <img src={item_data.img }/>

            <strong>$ { item_data.price }</strong>

            <ModalForm onSubmit={ event => addProductToBasket(event, item_data) }>
                <Input placeholder='Cantidad en kg' label='Cantidad en kilogramos' name='kg' required/>
                <ModalButtons>
                    <Button className="bg-red" onClick={ handleModalClose }>Cancelar</Button>
                    <Button type='submit' className="bg-primary">Guardar</Button>
                </ModalButtons>
            </ModalForm>
            
        </ProductCardModal>
    };

    const openProductModal = product_data => {
        if(currentClient){
            setModalState({visible: true, content: modalContent(product_data)});
        }

        else{
            alert('Por favor seleccionar cliente primero');
        }
        
    };

    const paymentModalContent = () => {
        return <ProductCardModal>

            <ModalForm onSubmit={ event => payOrder(event) }>
                <p style={ {marginBottom: 20, textAlign: 'center', fontSize: 18} }>Total a pagar: <strong>${ getTotal(basket)} </strong></p>
                <Input type='number' placeholder='Pago en pesos' label='Pago recibido' name='pago'/>
                <ModalButtons>
                    <Button type='submit' className="bg-primary">Pagar</Button>
                    <Button className="bg-red" onClick={ handleModalClose }>Cancelar</Button>
                </ModalButtons>
            </ModalForm>
            
        </ProductCardModal>
    };

    const openPaymentModal = product_data => {
        if(currentClient && basket.length > 0){
            setModalState({visible: true, content: paymentModalContent(product_data)});
        }

        else{
            alert('Por favor agrege productos a la canasta');
        }
        
    };

    return(
        <Layout active='Pedidos' >
            <MainContainer>
                <Header>
                    <CustomerStatus>
                        <CustomerData>
                            <CustomerDataItem>
                                <strong>Cliente:</strong>
                                <p>{ currentClient ? currentClient.name : 'Ninguno' } </p>
                            </CustomerDataItem>

                            <CustomerDataItem>
                                <strong>Deuda:</strong>
                                <p>{ currentClient ? `${'$'}${currentClient.debt }`: `$0` } </p>
                            </CustomerDataItem>

                        </CustomerData>

                        <select className="bg-primary" onChange={ onChangeSelect }>
                            <option value={''}>SELECCIONAR CLIENTE</option>
                            { clients ? clients.map(client => <option value={ `${client.id},${client.nombre},20` }> {client.nombre} </option>) : null}
                        </select>
                    </CustomerStatus>

                    <UserPicture />    
                </Header>


                <ProductContainer>
                    <ProductLeftSide>
                        <ProductList>
                            { products ? products.map( (product, index) => <ProductCard key={index} handleOnClick={ () => openProductModal(product) } img={ product.img } price={ product.price } /> ) : null}
                        </ProductList>

                        <ButtonGroup>
                            <Button color={'red'} className="bg-red lg-p">FIAR PEDIDO</Button>
                            <Button color={'blue'} className="bg-blue lg-p" onClick={ printPageArea }>TICKET</Button>
                            <Button color={'black'} className="bg-black lg-p">ENVIAR</Button>
                        </ButtonGroup>
                    </ProductLeftSide>

                    <Ticket items={ basket } cancelOrder={ clearBasket } payOrder={ openPaymentModal } />
                </ProductContainer>
            </MainContainer>

            <Modal title='Mi titulo' visible={ modalState.visible }  handleModalClose={  handleModalClose } >
                { modalState.content }
            </Modal>
        </Layout>
    );
}