import Layout from "../components/Layout.";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPen } from "@fortawesome/free-solid-svg-icons";
import Input from "../components/Input/Input";
import Button from "../components/Button";
import Keypad from "../components/Keypad";

import { useState, useEffect} from 'react';
import { getItems, updateItem, deleteItem, insertItem, SP_API } from "../utils/SP_APPI";
import Modal from "../components/Modal/Modal";
import useModal from "../hooks/useModal";

const Container = styled.div`
    padding: 20px;
`;

const StyledInput = styled(Input)`
    background-color: red;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: space-between;

    & button{
        width: 45%;
    }
`;

const ButtonGroupTop = styled.div`
    display: inline-block;
    justify-content: space-between;

    & button{
        margin-left: 20px;
        width:300px;
    }
`;

const ControlButton = styled(Button)`
    width: 100%;
    margin-top: 20px;
    border-radius: 60px;
`;

const StyledTable = styled.table`
    border-collapse: collapse;
    border: 1px solid black;
    font-size: 22px;
    overflow: hidden;

    display: inline-block;

    max-height: 320px;
    overflow-y: scroll;

    tbody tr:nth-child(even) {
        background-color: #eee;
    }

    td{
        padding: 5px;
    }
      
    thead tr {
        background-color: #26C485;
        color: #000;
        text-align: left;
    }
`;

const PaymentAmount = styled.p` 
    font-size: 36px;
    font-weight: 600;
    text-align: center;
`;
export default function Suppliers(){
    const [tableData, setTableData] = useState(null);
    const [cashRegisterStatus, setCashRegisterStatus] = useState(null);
    const { modalState, setModalState, handleModalClose } = useModal();
    const { modalState: withdrawModalState, setModalState: setWithdrawModalState, handleModalClose: handleWithdrawModalClose } = useModal();

    const [ currentNumber, setCurrentNumber ] = useState('');
    const [ cashRegisterRecords, setCashRegisterRecords ]  = useState(null);
    const [filters, setFilters] = useState({fecha: null});


    const fields = ['Nombre', 'Eliminar', 'Modificar'];

    const initialFunction = async () => {
        let res = await getItems('proveedores');
        let res_cash_register = await getItems('estado-caja');
        let res_cash_register_records = await getItems('cierres-caja');
        console.log(res_cash_register_records.cierres_caja);
        setCashRegisterRecords(res_cash_register_records.cierres_caja);

        if(res.err !== true){
            setTableData(res);
            console.log(res);
        }
        
        if(res_cash_register.err !== true){
            if(res_cash_register.caja){
                console.log(res_cash_register);
                setCashRegisterStatus(
                    {...res_cash_register,
                        retiros: res_cash_register.retiros ? res_cash_register.retiros : 0,
                        ingresos: res_cash_register.ingresos ? res_cash_register.ingresos : 0
                    });
            }
        }
        
    };

    const createSupplier = async evt =>{
        evt.preventDefault();
        let data = {
            nombre: evt.target.nombre.value,
        };

        let res = await insertItem('proveedor', data);
        if(res.err === false){
            evt.target.reset(); 
            initialFunction();   
        }

        else{
            alert('Error al actualizar proveedor');
        }
    };
    
    const openEditModal = data => {
        setModalState({visible: true, content: editModal(data)});
    };

    const updateSupplier= async evt => {
        evt.preventDefault();
        let data = {
            nombre: evt.target.nombre.value,
            supplier_id: evt.target.supplier_id.value
        };
        
        handleModalClose();

        let res = await updateItem('proveedor', data);
        if(res.err === false){
            initialFunction();    
        }

        else{
            alert('Error al actualizar proveedor');
        }
    };

    const openCashRegister = async evt => {
        evt.preventDefault();
        let fondo = evt.target.fondo.value;
        if(fondo){
            let data = { fondo };
            let res = await SP_API('http://localhost:3002/abrir-caja', 'POST', data);
            console.log(res);
        }
        window.location.reload();
    }
    
    const closeCashRegister = async evt => {
        evt.preventDefault();
        let data = {
            ingresos: cashRegisterStatus.ingresos,
            retiros: cashRegisterStatus.retiros,
            total: cashRegisterStatus.ingresos - cashRegisterStatus.retiros + cashRegisterStatus.caja.fondo
        };

        let res = await SP_API('http://localhost:3002/cerrar-caja', 'POST', data);
        console.log(res);
        window.location.reload();
    }

    const withdrawMoney = async evt => {
        evt.preventDefault();
        let monto = evt.target.monto.value;
        let data = {monto}
        let res = await SP_API('http://localhost:3002/retirar-dinero', 'POST', data);
        console.log(res);
        window.location.reload();
    }

    const editModal = item_data => {
        return <div className="product-card-modal">

        <p>Editar datos de <strong style={ {fontSize: 16}}>{ item_data.nombre }</strong></p>

        <form className="modal-form" onSubmit={ updateSupplier }>
            <input type='hidden' name='supplier_id' required defaultValue={item_data.id} /> 
            <Input placeholder='Nombre' label='Nombre' name='nombre' required defaultValue={item_data.nombre} /> 
            <div className="modal-buttons">
                <Button className="bg-primary" type='submit'>Guardar</Button>
                <Button className="bg-red" onClick={ handleModalClose }>Cancelar</Button>
            </div>
        </form>
    </div>
    };

    const deleteSupplier = async evt => {
        evt.preventDefault();
        let supplier_id = evt.target.supplier_id.value;
        
        handleModalClose();

        let res = await deleteItem('proveedor', supplier_id);
        if(res.err === false){
            initialFunction();    
        }

        else{
            alert('Error al eliminar proveedor');
        }
    }

    const confirmationModal = (_date) => {
        return <div className="product-card-modal">

        <p>Confirma hacer el cierre de caja del dia <strong style={ {fontSize: 16}}>{ _date }</strong></p>
            <form className="modal-form" onSubmit={ closeCashRegister }>
                <div className="modal-buttons">
                    <Button className="bg-red" type='submit'>SI, CERRAR CAJA</Button>
                    <Button className="bg-white" onClick={ handleModalClose }>CANCELAR</Button>
                </div>
            </form>
        </div>
    };

    const openConfirmationModal = data => {
        let date_ob = new Date();
        // current date
        // adjust 0 before single digit date
        let date = ("0" + date_ob.getDate()).slice(-2);
    
        // current month
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    
        // current year
        let year = date_ob.getFullYear();

        let datetime = year + "-" + month + "-" + date;
        setModalState({visible: true, content: confirmationModal(datetime)});
    };

    const deleteModal = item_data => {
        return <div className="product-card-modal">

        <p>¿De verdad desea eliminar a <strong style={ {fontSize: 16}}>{ item_data.nombre}</strong>?</p>

        <form className="modal-form" onSubmit={ deleteSupplier }>
            <input type='hidden' name='supplier_id' defaultValue={ item_data.id } required/>
            <div className="modal-buttons" style={ {marginTop: 20} }>
                <Button className="bg-red" >Si, eliminar</Button>
                <Button type='submit' onClick={ handleModalClose }>Cancelar</Button>
            </div>
        </form>
    </div>
    };

    useEffect( () => {
        initialFunction();
    }, []);

    return(
        <Layout active='Caja'>
            <Container>
                <h2>
                    ADMINISTRACIÓN DE CAJA
                    { cashRegisterStatus ? cashRegisterStatus.caja.estado === 'abierta' ? 
                <> 
                        <ButtonGroupTop>
                            <ControlButton type='submit' className="bg-red" onClick={ openConfirmationModal } >CERRAR CAJA</ControlButton>
                        </ButtonGroupTop>
                </>
                : null : null }
                </h2>
                


                { cashRegisterStatus ? cashRegisterStatus.caja.estado === 'abierta' || cashRegisterStatus.caja.estado === 'cerrada' ? 
                <>
                    <h2>ESTADO CAJA</h2>
                    <div style={ {display: 'flex', justifyContent: 'space-around', fontSize: '30px'} }>
                        <div>
                            <h3>Retiros: </h3><p>${ cashRegisterStatus ? cashRegisterStatus.retiros : null} </p>
                            { cashRegisterStatus ? cashRegisterStatus.caja.estado === 'abierta' ? 
                                <Button className='bg-primary' onClick={ () => setWithdrawModalState({...withdrawModalState, visible: true}) }>REALIZAR RETIRO</Button>
                            : null : null }
                        </div>
                        <div>
                            <h3>Ingresos: </h3><p>${ cashRegisterStatus ? cashRegisterStatus.ingresos : null}</p>
                        </div>

                        <div>
                            <h3>Fondo: </h3><p>${ cashRegisterStatus ? cashRegisterStatus.caja.fondo : null}</p>
                        </div>

                        <div>
                            <h3>Total: </h3><p>${ cashRegisterStatus ? cashRegisterStatus.ingresos - cashRegisterStatus.retiros + cashRegisterStatus.caja.fondo: null}</p>
                        </div>
                    </div>

                    <h2>LISTA DE CIERRES DE CAJA</h2>

                    <div style={ { overflowX: 'auto'}}>
                        <StyledTable>
                            <thead>
                                <tr>
                                    <td>Fecha <input style={ {fontSize: 18} } type={'date'} name='date' onChange={ (evt) => setFilters({fecha: evt.target.value})}/></td>
                                    <td>Fondo</td>
                                    <td>Ingresos</td>
                                    <td>Retiros</td>
                                    <td>Total</td>
                                </tr>
                            </thead>

                            <tbody>
                            { cashRegisterRecords ? 
                                    cashRegisterRecords.filter( item => {
                                            // Filter by date
                                            if(filters.fecha)
                                                return item.fecha === filters.fecha;
                                            else
                                                return item;	
                                    }).map( (item, index) => {
                                    return <tr key={index}>
                                        <td>{ item.fecha }</td>
                                        <td>${ item.fondo }</td>
                                        <td>${ item.ingresos }</td>
                                        <td>${ item.retiros }</td>
                                        <td>${ item.total }</td>
                                    </tr>
                                })
                            : null}
                            </tbody>
                        </StyledTable>
                    </div>
                </>
                : null : null }

                { cashRegisterStatus ? null : 
                <>
                    <h2>APERTURA DE CAJA</h2>

                    <form onSubmit={ openCashRegister }>
                        <input type='hidden' value={currentNumber ? currentNumber : '0'} name='fondo' required/>
                        <PaymentAmount>Fondo: ${ currentNumber ? currentNumber : '0'}</PaymentAmount>
                        <Keypad currentNumber={currentNumber} setCurrentNumber={setCurrentNumber} />
                        <ButtonGroup>
                            <ControlButton type='submit' className="bg-primary">ABRIR CAJA</ControlButton>
                            <ControlButton type='reset' className="bg-red" onClick={ () => setCurrentNumber('') }>CANCELAR</ControlButton>
                        </ButtonGroup>
                    </form>
                </>
                }

            <Modal title='Mi titulo' visible={ modalState.visible }  handleModalClose={  handleModalClose } >
                { modalState.content }
            </Modal>

            <Modal visible={ withdrawModalState.visible }  handleModalClose={  handleWithdrawModalClose } >
                <form onSubmit={ withdrawMoney }>
                        <input type='hidden' value={currentNumber ? currentNumber : '0'} name='monto' required/>
                        <PaymentAmount>Retiro: ${ currentNumber ? currentNumber : '0'}</PaymentAmount>
                        <Keypad currentNumber={currentNumber} setCurrentNumber={setCurrentNumber} />
                        <ButtonGroup>
                            <ControlButton type='submit' className="bg-primary">RETIRAR</ControlButton>
                            <ControlButton type='reset' className="bg-red" onClick={ () => { setWithdrawModalState({...withdrawModalState, visible: false}); setCurrentNumber('')} }>CANCELAR</ControlButton>
                        </ButtonGroup>
                </form>
            </Modal>
            </Container>

        </Layout>
    );
}