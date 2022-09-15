import Layout from "../../components/Layout.";
import Button from "../../components/Button";
import UserPicture from "../../components/UserPicture";
import ProductCard from "./ProductCard";

import styled from 'styled-components';
import { useEffect, useState, useRef } from "react";

import Ticket from "../../components/Ticket";
import Modal from "../../components/Modal/Modal";

import useModal from "../../hooks/useModal";
import Keypad from "../../components/Keypad";
import { getItems, insertItem, SP_API } from "../../utils/SP_APPI";
import { getTotal, roundNumber } from "../../utils/Operations";

const MainContainer = styled.div`
    margin: 20px 20px 5px 20px;
`;

const Header = styled.header` 
    display: flex;
    justify-content: space-between;

    h2{
        width: 50%;
        text-align: center;
        font-weight: 700;
        font-size: 30px;
    }
`;

const CustomerStatus = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 70%;

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

const CustomerDataItemBascula = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-around;
    width: 100%;
    background: #26C485;
    padding: 10px;
    border-radius: 10px;
    margin-left: 10px;

    p, strong{
        font-size: 30px;
    }
    & > p{
        width: 100%;
        text-align:center;
        margin: 5px auto;
    }

    & > strong{
        width: 100%;
        text-align:center;
    }
`;

const CustomerDataItemLeft = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    grid-column-gap: 10px;
    grid-row-gap: 10px;
    max-width: 100%;
    margin-top: 20px;
    height: 100%;
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
    width: 100%;

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
    const [ kgInterval, setKgInterval] = useState(null);
    const [ finalKg, setFinalKg ] = useState(0);
    const [ currentKg, setCurrentKg] = useState(1);
    const [ contraEntrega, setContraEntrega ] = useState(false);
    const [ cashRegister, setCashRegister ] = useState(null);
    const [ paymentError, setPaymentError ]  = useState('');
    const [ errorBascula, setErrorBascula ] = useState(null);
    const [ errorMsj, setErrorMsj ] = useState('');
    let counter = 0;

    const selectClientRef = useRef(null);

    const getCurrentKg = async () => {
        let res_kg = await SP_API('http://localhost:3002/bascula', 'GET');
        if(res_kg.kg_bascula === -100){
            console.log('Error en bascula')
            if(counter === 0){
                setCurrentKg('Error');
                // console.log('Ok no entra aqui')
                setModalState({visible: true, content: errorBasculaModal()});
                counter = 10;
            }
        }

        else{
            setCurrentKg(res_kg.kg_bascula);
            counter = 0;
        }
        // else{
        //     console.log('Buena lectura en bascula');
        //     if(errorBascula === true){
        //         console.log('Error definido')
        //         setErrorBascula(false);
        //     }
        //     setCurrentKg(res_kg.kg_bascula);

        // }
        // setCurrentKg( roundNumber((Math.random() * 10)));
    };

    const errorBasculaModal = () => {
        return <div className="product-card-modal">

        <p style={ {fontSize: 26, color: 'red'} }>Error de comunicación. Reconectar báscula y reiniciar programa.</p>
        <Button className="bg-white" type="button" onClick={ handleModalClose }>Aceptar</Button>
    </div>
    };

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

    const getCashRegister = async () => {
        let cash_register = await SP_API('http://localhost:3002/estado-caja', 'GET');
        console.log(cash_register);
        if(!cash_register.caja){
            setModalState({visible: true, content: alert('Favor de abrir caja para realizar pedidos') });
        }
        else if(cash_register.caja.estado === 'cerrada'){
            setModalState({visible: true, content: alert('Caja cerrada. Favor de abrir la caja el dia siguiente para realizar pedidos') });
        }

        setCashRegister(cash_register);
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
                    setCurrentDebt(roundNumber(res[0].deuda_cliente));
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
                    efectivo: null,
                    cajero: localStorage.getItem('username'),
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

            else{
                if(getTotal(basket) <= payment){
                    console.log('pago normal');
                    let order = {
                        total: Number(getTotal(basket)),
                        payment: Number(getTotal(basket)),
                        items: basket,
                        client: currentClient,
                        estado: 1,
                        chalan: null,
                        efectivo: payment,
                        cajero: localStorage.getItem('username'),
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
                    setPaymentError('La cantidad ingresada para el pago no es valida. Favor de verificar.');
                    console.log('Ingresa una cantidad correcta');
                }
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
                efectivo: null,
                cajero: localStorage.getItem('username'),
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
    };

    const addProductToBasket = (evt, item_data) => {
        setErrorMsj('');
        evt.preventDefault();
        let kg = Number(evt.target.kg.value);
        console.log(kg);
        if(kg > 0){
            item_data.kg = kg;
        }

        else{
            setErrorMsj('Error. Favor de introducir una cantidad valida.');
            // item_data.kg = currentNumber;
            return null;
        }

        console.log(item_data.kg);
        let item_exists = basket.find( basket_item => basket_item.id === item_data.id);
        if(item_exists){
            let new_basket = basket.map(basket_item => {
                if(basket_item.id === item_data.id){
                    console.log('econtrado, basket kg: '+ basket_item.kg, ' item kg: '+item_data.kg);
                    return {
                        ...basket_item,
                        kg: basket_item.kg + item_data.kg
                    };
                }
                return basket_item;
            });
            setBasket(new_basket);
        }

        else{
            setBasket([item_data, ...basket]);
        }
        
        handleProductModalClose();
        setCurrentNumber('');
        evt.target.reset();
        return null;
    };

    const addProductToBasketHidden = item_data => {
        if(currentKg !== 'Error'){
            item_data.kg = roundNumber(Number(currentKg));
            // console.log(item_data.kg);
            let item_exists = basket.find( basket_item => basket_item.id === item_data.id);
            if(item_exists){
                let new_basket = basket.map(basket_item => {
                    if(basket_item.id === item_data.id){
                        console.log('econtrado, basket kg: '+ basket_item.kg, ' item kg: '+item_data.kg);
                        return {
                            ...basket_item,
                            kg: Number(basket_item.kg) + Number(currentKg)
                        };
                    }
                    return basket_item;
                });
                setBasket(new_basket);
            }
    
            else{
                setBasket([item_data, ...basket]);
            }
            setCurrentNumber('');
        }
        return null;
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
            console.log(product_data);
            if(product_data.venta_por === 'kg'){
                console.log(currentKg);
                if((Number(currentKg)).toFixed(2) <= 0){
                    return null;
                }
                else{
                    addProductToBasketHidden(product_data);
                }
            }

            else if(product_data.venta_por === 'pza'){
                setProductModalState({visible: true});
            }
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

    const resetSelect = () => {
        selectClientRef.current.selectedIndex = 0;
    };

    const openDeleteItemModal = product_data => {
        setModalState({visible: true, content: deleteItemModal(product_data)});
    };

    const deleteItem = (evt, item) => {
        evt.preventDefault();
        setBasket(basket.filter(basket_item => basket_item.id !== item.id));
        console.log('deleting item', item);
        setModalState({visible: false, content: null});

    }

    const deleteItemModal = item => {
        return <div className="product-card-modal">

        <p style={ {fontSize: 24}}>Confirma eliminar <strong style={ {fontSize: 24}}>{ item.name} x {item.kg} kg</strong> del pedido</p>

        <form className="modal-form" onSubmit={  event => deleteItem(event, item) }>
            <div className="modal-buttons">
                <Button className="bg-red" type='submit'>Eliminar</Button>
                <Button className="bg-white" onClick={ handleModalClose }>Cancelar</Button>
            </div>
        </form>
    </div>
    };
    
    useEffect( () => {
        getProducts();
        getClients();
        getChalanes();
        getCashRegister();
        setKgInterval(setInterval(getCurrentKg, 900));
    }, []);

    return(
        <Layout active='Inicio'>
            <MainContainer>
            { cashRegister ? ( cashRegister.caja ? cashRegister.caja.estado === 'abierta' ? 
                <>
                <Header>
                    <CustomerStatus>
                        <CustomerData>
                            <CustomerDataItem>
                                <strong>Cliente:</strong>
                                    <select className="" style={ {background: '#CFDFE3', fontSize: 20} } ref={ selectClientRef }  onChange={ onChangeSelect }>
                                    <option value={''}>SELECCIONAR CLIENTE</option>
                                    <option value={'0,Cliente de paso,0'}>CLIENTE DE PASO</option>
                                    { clients ? clients.map(client => <option value={ `${client.id},${client.nombre},${client.adeudo}` }> {client.nombre} </option>) : null}
                                </select>
                            </CustomerDataItem>

                            <CustomerDataItemLeft>
                                <strong>Deuda:</strong>
                                <p>{ currentDebt ?'$'+ currentDebt : '$0'} </p>
                            </CustomerDataItemLeft>

                        </CustomerData>


                        <CustomerDataItemBascula>
                                <p>Báscula :</p>
                                <strong>{ currentKg !== 'Error' ? currentKg + ' kg': 'Error' } </strong>
                        </CustomerDataItemBascula>

                    </CustomerStatus>

                    <h2>Pedido</h2>
                </Header>

                <ProductContainer>
                    <ProductLeftSide>
                        <ProductList>
                            { products ? products.map( (product, index) => <ProductCard key={index} handleOnClick={ () => openProductModal(product) } img={ product.img } price={ product.price } name={ product.name } /> ) : null }
                        </ProductList>
                        {/*
                        <ButtonGroup>
                            <Button color={'blue'} className="bg-blue lg-p" onClick={ printPageArea }>TICKET</Button>
                            <Button color={'black'} className="bg-black lg-p" onClick={ openShippingModal } >ENVIAR</Button>
                        </ButtonGroup>
                        */
                        }
                    </ProductLeftSide>
                    
                    <Ticket items={ basket } openPaymentModal={openPaymentModal} cancelOrder={ () => { clearBasket(); setCurrentClient(null); setCurrentDebt(0); resetSelect(); } } payOrder={ () => openPaymentModal(false) } restrictedMode={ restrictedMode } onClickItem={openDeleteItemModal}/>
                </ProductContainer>
                </>
                : null : null ) : null}
            </MainContainer>

            { /* Inmutable modal */}
            <Modal title='Mi titulo' visible={ modalState.visible }  handleModalClose={  handleModalClose } >
                { modalState.content }
            </Modal>

            {/* Payment Modal */}
            <Modal title='Payment modal' visible={ paymentModalState.visible }  handleModalClose={ () => { handlePaymentModalClose(); setCurrentNumber(''); } } >
                <ModalForm onSubmit={ event => payOrder(event) }>
                    <Total>Total a pagar: <strong>${ getTotal(basket)} </strong></Total>
                    <Change>Cambio: <strong>${ currentNumber ? ( Number(currentNumber) - Number(getTotal(basket)) > 0 ? roundNumber(Number(currentNumber) - Number(getTotal(basket) )) : '0' ) : '0'} </strong></Change>
                    <PaymentAmount>${ currentNumber ? currentNumber : '0'}</PaymentAmount>
                    <input type='hidden' value={currentNumber ? currentNumber : '0'} name='pago'/>

                    <div>{paymentError ? <p style={ {fontSize: 24, color: 'red', textAlign: 'center'} }>{paymentError}</p> : null}</div>
                    <ContraEntrega>
                        { /* <h3 style={{ textAlign: 'center', fontSize: 20}}>Contra engrega <input type='checkbox' style={ {padding: '10px'} } onChange={ (event) => setContraEntrega(event.target.checked) } /></h3> */}
                        <h2>Pago contra entrega</h2>
                        { chalanesSelect }
                    </ContraEntrega>

                    <Keypad currentNumber={currentNumber} setCurrentNumber= { (val) => {setCurrentNumber(val); setPaymentError('') }} />
                    
                    <ModalButtons>
                        <Button type="submit" className="bg-primary">Pagar</Button>
                        <Button type="button" className="bg-red" onClick={ () => { handlePaymentModalClose(); setCurrentNumber('');  } }>Cancelar</Button>
                    </ModalButtons>
                </ModalForm>
            </Modal>

            {/* Product card modal */}
            <Modal title='Product card modal' visible={ productModalState.visible }  handleModalClose={  () => { handleProductModalClose(); setCurrentNumber(''); setErrorMsj('');clearInterval(kgInterval); } } >
                { currentProduct ? 
                    <ProductCardModal>
                        <img src={currentProduct.img }/>

                        <p style={ {fontSize: 26} }>{ currentProduct.name }</p>
                        <strong style={ {fontSize: 36} }>$ { currentProduct.price } x pza</strong>

                        <p style={ {fontSize: 26, color: 'red'} }>{ errorMsj }</p>

                        <ModalForm onSubmit={ event => { addProductToBasket(event, currentProduct); }}>
                            { /* <Input placeholder='Cantidad en kg' label='Cantidad en kilogramos' name='kg' required/> */}
                            <input type='hidden' value={ currentNumber } name='kg'/>
                            {/* 
                                <PaymentAmount>En bascula: { currentKg } kg</PaymentAmount>
                                <PaymentAmount>Peso total: { finalKg } kg</PaymentAmount>
                            */}

                            <PaymentAmount style={ {marginTop:5, marginBottom: 5}}>Total: ${ currentNumber ? currentNumber*currentProduct.price : '0'}</PaymentAmount>
                            <PaymentAmount style={ {marginTop:5}}>Piezas: { currentNumber ? currentNumber : '0'}</PaymentAmount>
                            <Keypad currentNumber={currentNumber} setCurrentNumber={ (val) => { setCurrentNumber(val); setErrorMsj('') }} />

                            <ModalButtons>
                                    <Button type='button' className="bg-red" onClick={ () => { handleProductModalClose(); setCurrentNumber(''); setErrorMsj('') } }>Cancelar</Button>
                                    {/* <Button className="bg-blue ml" type='button' onClick={ () => { setFinalKg(finalKg+currentKg)} }>Agregar peso</Button> */}
                                    <Button type='submit' className="ml bg-primary">Guardar</Button>
                            </ModalButtons>

                            {
                            /* 
                                <Keypad currentNumber={currentNumber} setCurrentNumber={setCurrentNumber} />

                            */
                            }
                        </ModalForm>
                    </ProductCardModal>
                : null }
            </Modal>
        </Layout>
    );
};