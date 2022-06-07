import Layout from "../components/Layout.";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPen } from "@fortawesome/free-solid-svg-icons";
import Input from "../components/Input/Input";
import Button from "../components/Button";

import { useState, useEffect} from 'react';
import { getItems, updateItem, deleteItem, insertItem } from "../utils/SP_APPI";
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

const ControlButton = styled(Button)`
    width: 100%;
    margin-top: 20px;
    border-radius: 60px;
`;

const StyledTable = styled.table`
    border-collapse: collapse;
    border: 1px solid black;
    width: 100%;
    font-size: 22px;

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

export default function Suppliers(){
    const [tableData, setTableData] = useState(null);
    const { modalState, setModalState, handleModalClose } = useModal();

    const fields = ['Nombre', 'Eliminar', 'Modificar'];

    
    
    const initialFunction = async () => {
        let res = await getItems('proveedores');
        if(res.err !== true){
            setTableData(res);
            console.log(res);
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


    const openDeleteModal = data => {
        setModalState({visible: true, content: deleteModal(data)});
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
                <h2>ESTADO CAJA</h2>
                <div style={ {display: 'flex', justifyContent: 'space-around', fontSize: '20px'} }>
                    <div>
                        <h3>Retiros: </h3><p>(4) $1245</p>
                    </div>
                    <div>
                        <h3>Ingresos: </h3><p>$5332</p>
                    </div>
                    <div>
                        <h3>Total: </h3><p>$4212</p>
                    </div>
                </div>

                <h2>APERTURA DE CAJA</h2>

                <form onSubmit={ createSupplier }>

                    <StyledInput type='text' placeholder='Fondo' label='Fondo' name='Fondo' required/>

                    <ButtonGroup>
                        <ControlButton type='submit' className="bg-primary">ABRIR CAJA</ControlButton>
                        <ControlButton type='reset' className="bg-red" >CANCELAR</ControlButton>
                    </ButtonGroup>
                </form>

                <h2 style={ {margin: '60px 0px 10px 0px'} }>CIERRE DE CAJA</h2>
                <form onSubmit={ createSupplier }>
                    <ButtonGroup>
                        <ControlButton type='reset' className="bg-red" >CERRAR CAJA</ControlButton>
                    </ButtonGroup>
                </form>

            </Container>

            <Modal title='Mi titulo' visible={ modalState.visible }  handleModalClose={  handleModalClose } >
                { modalState.content }
            </Modal>

        </Layout>
    );
}