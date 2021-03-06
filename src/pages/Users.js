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

    const fields = ['Nombre', 'Rol', 'Eliminar', 'Modificar'];

    
    
    const initialFunction = async () => {
        let res = await getItems('usuarios');
        if(res.err !== true){
            setTableData(res);
            console.log(res);
        }      
    };

    const createUser = async evt =>{
        evt.preventDefault();
        let data = {
            nombre: evt.target.nombre.value,
            rol: Number(evt.target.rol.value),
            pswd: evt.target.pswd.value
        };

        let res = await insertItem('usuario', data);
        if(res.err === false){
            evt.target.reset(); 
            initialFunction();   
        }

        else{
            alert('Error al actualizar usuario');
        }
    };
    
    const openEditModal = data => {
        setModalState({visible: true, content: editModal(data)});
    };

    const updateUser = async evt => {
        evt.preventDefault();
        let data = {
            nombre: evt.target.nombre.value,
            rol: evt.target.rol.value,
            user_id: evt.target.user_id.value
        };
        
        handleModalClose();

        let res = await updateItem('usuario', data);
        if(res.err === false){
            initialFunction();    
        }

        else{
            alert('Error al actualizar usuario');
        }
    };

    const editModal = item_data => {
        return <div className="product-card-modal">

        <p>Editar datos de <strong style={ {fontSize: 16}}>{ item_data.nombre }</strong></p>

        <form className="modal-form" onSubmit={ updateUser }>
            <input type='hidden' name='user_id' required defaultValue={item_data.id} /> 
            <Input placeholder='Nombre' label='Nombre' name='nombre' required defaultValue={item_data.nombre} /> 
            <label style={ {marginBottom: 20} }>
                <p>Rol</p>
                <select name="rol" defaultValue={'' + item_data.rol }>
                    <option value="0">Usuario</option>
                    <option value="1" selected>Administrador</option>
                </select>
            </label>
            <div className="modal-buttons">
                <Button className="bg-primary" type='submit'>Guardar</Button>
                <Button className="bg-red" onClick={ handleModalClose }>Cancelar</Button>
            </div>
        </form>
    </div>
    };


    const deleteUser = async evt => {
        evt.preventDefault();
        let user_id = evt.target.user_id.value;
        
        handleModalClose();

        let res = await deleteItem('usuario', user_id);
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

        <p>??De verdad desea eliminar a <strong style={ {fontSize: 16}}>{ item_data.nombre}</strong>?</p>

        <form className="modal-form" onSubmit={ deleteUser }>
            <input type='hidden' name='user_id' defaultValue={ item_data.id } required/>
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
        <Layout active='Usuarios'>
            <Container>
                <h2>NUEVO USUARIO</h2>

                <form onSubmit={ createUser }>

                    <StyledInput type='text' placeholder='Nombre' label='Nombre' name='nombre' required/>
                    <StyledInput type='text' placeholder='Contrase??a' label='Contrase??a' name='pswd' required/>
                    <label>
                        <p>Rol</p>
                        <select name="rol">
                            <option value="0">Usuario</option>
                            <option value="1" selected>Administrador</option>
                        </select>
                    </label>

                    <ButtonGroup>
                        <ControlButton type='submit' className="bg-primary">GUARDAR</ControlButton>
                        <ControlButton type='reset' className="bg-red" >CANCELAR</ControlButton>
                    </ButtonGroup>
                </form>

                <h2>LISTA DE USUARIOS</h2>

                <div style={ { overflowX: 'auto'}}>
                    <StyledTable>
                        <thead>
                            <tr>
                                { fields.map( (item, index) => <td key={index}> { item} </td>)}
                            </tr>
                        </thead>

                        <tbody>
                            { tableData ? 
                                tableData.map( (item, index) => {
                                    return <tr key={index}>
                                        <td>{ item.nombre }</td>
                                        <td>{ item.rol === 1 ? 'Administrador' : 'Usuario' }</td>
                                        <td><Button className="bg-red" onClick={ () => openDeleteModal(item) }><FontAwesomeIcon icon={faTimes} /> Eliminar</Button> </td>
                                        <td><Button className="bg-blue" onClick={ () => openEditModal(item) }><FontAwesomeIcon icon={faPen} /> Editar</Button> </td>
                                    </tr>
                                })
                            : null}
                        </tbody>
                    </StyledTable>
                </div>
            </Container>

            <Modal title='Mi titulo' visible={ modalState.visible }  handleModalClose={  handleModalClose } >
                { modalState.content }
            </Modal>

            <style>
                {
                    `
                        label p{
                            font-weight: 600;
                        }

                        select{
                            padding: 5px;
                        }
                    `
                }
            </style>

        </Layout>
    );
}