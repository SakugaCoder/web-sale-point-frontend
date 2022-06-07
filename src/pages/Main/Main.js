import Layout from "../../components/Layout.";
import Button from "../../components/Button";
import UserPicture from "../../components/UserPicture";
import ProductCard from "./ProductCard";

import styled from 'styled-components';
import { useEffect, useState } from "react";

import Ticket from "../../components/Ticket";
import Modal from "../../components/Modal/Modal";

import useModal from "../../hooks/useModal";
import Keypad from "../../components/Keypad";
import { getItems, insertItem, SP_API } from "../../utils/SP_APPI";
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
    min-height: calc(100vh - 160px);
`;

const ProductLeftSide = styled.div`
    width: 60%;
    display: flex;
    flex-direction: column;
`;

const ProductList = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    grid-column-gap: 10px;
    grid-row-gap: 10px;
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
    margin-top: 20px;

    & button{
        width: 45%;
    }
`;

const Select = styled.div`
    display: block;
    width: 70%;
    margin: 20px auto;

    & select{
        width: 100%;
        padding: 10px;
        font-size: 18px;
    }
`;

const Total = styled.p` 
    font-size: 36px;
    text-align: center;
    margin-bottom: 0px;
    margin-top: 0px;
`;

const Change = styled.p`
    font-size: 36px;
    text-align: center;
    margin-top: 5px;
`;

const PaymentAmount = styled.p` 
    font-size: 36px;
    font-weight: 600;
    text-align: center;
`;

const ContraEntrega = styled.div`
    display: 'block';
    margin: 'auto';

    h2{
        text-align: center;
        font-weight: normal;
        margin-bottom: 10px;
        font-size: 26px;
    }

    select{
        display: block;
        font-size: 24px;
        margin: auto;
        margin-bottom: 20px
    }
`;

export default function Main(){
    let [products, setProducts] = useState([]);
    let [clients, setClients] = useState([]);
    let [chalanes, setChalanes] = useState([]);
    let [currentClient, setCurrentClient] = useState(null);
    let [currentDebt, setCurrentDebt] = useState(0);
    let [basket, setBasket] = useState([]);
    const { modalState: paymentModalState, setModalState: setPaymentModalState, handleModalClose: handlePaymentModalClose } = useModal();
    const { modalState: productModalState, setModalState: setProductModalState, handleModalClose: handleProductModalClose } = useModal();
    const { modalState, setModalState, handleModalClose } = useModal();
    const [ currentNumber, setCurrentNumber ] = useState('');
    const [ currentProduct, setCurrentProduct ] = useState(null);
    const [ restrictedMode, setRestrictedMode ] = useState(false);
    const [ contraEntrega, setContraEntrega ] = useState(false);

    const getProducts = async () => {
        let products = await getItems('Productos');
        setProducts(products);
        console.log(products);
    };

    const getClients = async () => {
        let products = await getItems('Clientes');
        setClients(products);
        console.log(products);
    };

    const getChalanes = async () => {
        let chalanes = await getItems('Chalanes');
        setChalanes(chalanes);
        // console.log(products);
    };

    const onChangeSelect = async evt => {
        if(evt.target.value){
            let client_data = evt.target.value.split(',');
            setCurrentDebt(0);
            setCurrentClient({id: client_data[0], name: client_data[1], debt: client_data[2] ? client_data[2] : 0});
            if(Number(client_data[0]) === 0){
                setRestrictedMode(true);
            }

            else{
                // Get client debt
                let res = await SP_API('http://localhost:3002/deuda-usuario/'+client_data[0], 'GET');
                if(res){
                    setCurrentDebt(res[0].deuda_cliente);
                }
                console.log(res);
                setRestrictedMode(false);
            }
        }
        else{
            setCurrentClient(null);
        }    
    };

    const clearBasket = () => setBasket([]);

    const payOrder = async (evt, trusted = false) => {
        evt.preventDefault();
        let payment = Number(evt.target.pago.value);
        if(evt.target.contra_entrega){
            if(Number(evt.target.contra_entrega.value) !== 0){
                console.log('pago contra entrega');
                let order = {
                    total: Number(getTotal(basket)),
                    payment: Number(getTotal(basket)),
                    items: basket,
                    client: currentClient,
                    estado: 4,
                    chalan: evt.target.contra_entrega.value,
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
        }

        else{
            if(trusted === false){
                if(getTotal(basket) <= payment){
                    console.log('pago normal');
                    let order = {
                        total: Number(getTotal(basket)),
                        payment: Number(getTotal(basket)),
                        items: basket,
                        client: currentClient,
                        estado: 1,
                        chalan: null,
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
                    console.log('Ingresa una cantidad correcta');
                }
            }
    
            else{
                console.log('fiado');
                // alert('Error al procesar el pago. Favor de especificar una cantidad mayor o igual al total');
                let order = {
                    total: Number(getTotal(basket)),
                    payment,
                    items: basket,
                    client: currentClient,
                    estado: 2,
                    chalan: null,
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
        }
    };

    const addProductToBasket = (evt, item_data) => {
        evt.preventDefault();
        let kg = Number(evt.target.kg.value);
        if(kg > 0){
            item_data.kg = kg;
            setBasket([...basket, item_data])
            handleProductModalClose();
            setCurrentNumber('');
            evt.target.reset();
            return null;
        }
        alert('Favor de especificar la cantidad');
    };

    const modalContent = item_data => {
        return 
    };

    const alert = msj => {
        return <ProductCardModal>
            <p style={ {fontSize: 20} }>{ msj }</p>

            <ModalForm onSubmit={ handleModalClose } style={ {display: 'flex', justifyContent: 'center'} }>
                <Button type='submit' className="bg-primary">Entendido</Button>
            </ModalForm>
            
        </ProductCardModal>
    }

    const openProductModal = product_data => {
        setCurrentProduct(product_data);
        if(currentClient){
            setProductModalState({visible: true});
        }

        else{
            setModalState({visible: true, content: alert('Por favor seleccionar cliente primero')});
        }
    };

    const paymentModalContent = trusted => {
        return <ProductCardModal>
            { !trusted ? 
                null
            :

            <ModalForm onSubmit={ event => payOrder(event, true) }>

                <p style={ {marginBottom: 20, textAlign: 'center', fontSize: 18} }>Total a pagar (fiado): <strong>${ getTotal(basket)} </strong></p>
                <input type='hidden' defaultValue='0' name='pago'/>
                <ModalButtons>
                    <Button type='submit' className="bg-primary">Fiar</Button>
                    <Button className="bg-red" onClick={ handleModalClose }>Cancelar</Button>
                </ModalButtons>
            </ModalForm>
        }
            
        </ProductCardModal>
    };

    const openPaymentModal = is_trusted => {
        if(currentClient && basket.length > 0){
            if(is_trusted){
                setModalState({visible: true, content: paymentModalContent(is_trusted)});
            }

            else{
                setPaymentModalState({visible: true, content: null});
            }
        }

        else{
            alert('Por favor agrege productos a la canasta');
        }
    };

    const chalanesSelect = chalanes ? <select name='contra_entrega'>
        <option value='0'>Seleccionar chalan</option>
        { chalanes.map( chalan => <option value={chalan.id + ',' + chalan.nombre}>{ chalan.nombre}</option>) }
    </select> : null;

    
    useEffect( () => {
        getProducts();
        getClients();
        getChalanes();
    }, []);

        /*
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
    */

    /*
    const sendOrder = async evt => {
        evt.preventDefault();
        let order = {
            total: Number(getTotal(basket)),
            payment: 0,
            items: basket,
            client: currentClient,
            estado: 3,
            chalan: evt.target.chalan_id.value,
            date:  (new Date().toISOString().split(':')[0]).split('T')[0]
        }

        let res = await insertItem('pedido', order);
        if(res.err === false){
            window.location.reload();
        }
        console.log(res);
        console.log(order);
        handleModalClose();
        console.log(order);
    }

    const shippingModal = () => {
        return  <ModalForm onSubmit={ sendOrder }>
            <p style={ {marginBottom: 20, textAlign: 'center', fontSize: 18} }>Enviando pedido a <strong>{ currentClient.name }</strong></p>
            <p style={ {marginBottom: 20, textAlign: 'center', fontSize: 18} }>Total a pagar: <strong>${ getTotal(basket)} </strong></p>
            <Select>
                    <p>Chalan</p>
                    <select name="chalan_id">
                        { chalanes ? chalanes.map(chalan => <option value={ chalan.nombre }> {chalan.nombre} </option>) : null}
                    </select>
            </Select>

            <input type='hidden' value={0} name='payment' />

            <ModalButtons>
                <Button type='submit' className="bg-primary">Enviar</Button>
                <Button className="bg-red" onClick={ handleModalClose }>Cancelar</Button>
            </ModalButtons>
        </ModalForm>
    }

    const openShippingModal = () => {
        if(currentClient && basket.length > 0){
            setModalState({visible: true, content: shippingModal()});
        }

        else{
            alert('Por favor agrege productos a la canasta');
        }
        
    };
    */

    return(
        <Layout active='Inicio'>
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
                                <p>{ currentDebt ?'$'+ currentDebt : '$0'} </p>
                            </CustomerDataItem>

                        </CustomerData>

                        <select className="bg-primary" onChange={ onChangeSelect }>
                            <option value={''}>SELECCIONAR CLIENTE</option>
                            <option value={'0,Cliente de paso,0'}>Cliente de paso</option>
                            { clients ? clients.map(client => <option value={ `${client.id},${client.nombre},${client.adeudo}` }> {client.nombre} </option>) : null}
                        </select>
                    </CustomerStatus>

                    <UserPicture />    
                </Header>

                <ProductContainer>
                    <ProductLeftSide>
                        <ProductList>
                            { products ? products.map( (product, index) => <ProductCard key={index} handleOnClick={ () => openProductModal(product) } img={ product.img } price={ product.price } /> ) : null}
                        </ProductList>
                        {/*
                        <ButtonGroup>
                            <Button color={'blue'} className="bg-blue lg-p" onClick={ printPageArea }>TICKET</Button>
                            <Button color={'black'} className="bg-black lg-p" onClick={ openShippingModal } >ENVIAR</Button>
                        </ButtonGroup>
                        */
                        }
                    </ProductLeftSide>

                    <Ticket items={ basket } openPaymentModal={openPaymentModal} cancelOrder={ clearBasket } payOrder={ () => openPaymentModal(false) } restrictedMode={ restrictedMode }/>
                </ProductContainer>
            </MainContainer>

            { /* Inmutable modal */}
            <Modal title='Mi titulo' visible={ modalState.visible }  handleModalClose={  handleModalClose } >
                { modalState.content }
            </Modal>

            {/* Payment Modal */}
            <Modal title='Payment modal' visible={ paymentModalState.visible }  handleModalClose={ () => { handlePaymentModalClose(); setCurrentNumber(''); } } >
                <ModalForm onSubmit={ event => payOrder(event) }>
                    <Total>Total a pagar: <strong>${ getTotal(basket)} </strong></Total>
                    <Change>Cambio: <strong>${ currentNumber ? ( Number(currentNumber) - Number(getTotal(basket)) > 0 ? (Number(currentNumber) - Number(getTotal(basket) )).toFixed(2) : '0' ) : '0'} </strong></Change>
                    <PaymentAmount>${ currentNumber ? currentNumber : '0'}</PaymentAmount>
                    <input type='hidden' value={currentNumber ? currentNumber : '0'} name='pago'/>

                    <ContraEntrega>
                        { /* <h3 style={{ textAlign: 'center', fontSize: 20}}>Contra engrega <input type='checkbox' style={ {padding: '10px'} } onChange={ (event) => setContraEntrega(event.target.checked) } /></h3> */}
                        <h2>Contra entrega</h2>
                        { chalanesSelect }
                    </ContraEntrega>

                    <Keypad currentNumber={currentNumber} setCurrentNumber={setCurrentNumber} />

                    
                    <ModalButtons>
                        <Button type="submit" className="bg-primary">Pagar</Button>
                        <Button type="button" className="bg-red" onClick={ () => { handlePaymentModalClose(); setCurrentNumber(''); } }>Cancelar</Button>
                    </ModalButtons>
                </ModalForm>
            </Modal>

            {/* Product card modal */}
            <Modal title='Product card modal' visible={ productModalState.visible }  handleModalClose={  () => { handleProductModalClose(); setCurrentNumber(''); } } >
                { currentProduct ? 
                    <ProductCardModal>
                        <img src={currentProduct.img }/>

                        <strong>$ { currentProduct.price }</strong>

                        <ModalForm onSubmit={ event => addProductToBasket(event, currentProduct) }>
                            { /* <Input placeholder='Cantidad en kg' label='Cantidad en kilogramos' name='kg' required/> */}
                            <input type='hidden' value={currentNumber ? currentNumber : '0'} name='kg' required/>
                            <PaymentAmount>{ currentNumber ? currentNumber : '0'} kg</PaymentAmount>
                            <Keypad currentNumber={currentNumber} setCurrentNumber={setCurrentNumber} />
                            <ModalButtons>
                                <Button className="bg-red" onClick={ () => { handleProductModalClose(); setCurrentNumber(''); } }>Cancelar</Button>
                                <Button type='submit' className="bg-primary">Guardar</Button>
                            </ModalButtons>
                        </ModalForm>
                    </ProductCardModal>
                : null }
            </Modal>
        </Layout>
    );
}