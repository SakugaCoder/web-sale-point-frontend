import Layout from "../components/Layout.";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPen } from "@fortawesome/free-solid-svg-icons";
import Input from "../components/Input/Input";
import Button from "../components/Button";

import { useState, useEffect, useMemo} from 'react';
import { useTable, useSortBy } from 'react-table';
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
    th{
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
    const [shopping, setShopping] = useState(null);
    const [products, setProducts] = useState(null);
    const [suppliers, setSuppliers] = useState(null);
    const { modalState, setModalState, handleModalClose } = useModal();
    const [filters, setFilters] = useState({fecha: null, proveedor: null});

    const fields = ['Producto', 'Kg','Fecha', 'Proveedor', 'Eliminar'];
    
    const initialFunction = async () => {
        let res = await getItems('Compras');
        if(res.err !== true){
            setTableData(res.map( item => {
                return {
                    ...item,
                    eliminar: item
                }
            }));

            setShopping(res.map( item => {
                return {
                    ...item,
                    eliminar: item
                }
            }));
            console.log(res);
        }

        let res_products = await getItems('Productos');
        setProducts(res_products);

        let res_suppliers = await getItems('Proveedores');
        setSuppliers(res_suppliers);
    };

    const createShopping = async evt =>{
        evt.preventDefault();
        let data = {
            product_id: Number(evt.target.product_id.value),
            kg: evt.target.kg.value,
            date: evt.target.date.value,
            supplier_id: Number(evt.target.supplier_id.value),
        };

        let res = await insertItem('compra', data);
        if(res.err === false){
            evt.target.reset(); 
            initialFunction();   
        }

        else{
            alert('Error al actualizar compra');
        }
    };
    
    /*
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
    */

    const deleteShopping = async evt => {
        evt.preventDefault();
        let shopping_id = evt.target.shopping_id.value;
        
        handleModalClose();

        let res = await deleteItem('compra', shopping_id);
        if(res.err === false){
            initialFunction();    
        }

        else{
            alert('Error al eliminar compra');
        }
    }

    const openDeleteModal = data => {
        setModalState({visible: true, content: deleteModal(data)});
    };

    const deleteModal = item_data => {
        return <div className="product-card-modal">

        <p>¿De verdad desea eliminar esta compra?</p>

        <form className="modal-form" onSubmit={ deleteShopping }>
            <input type='hidden' name='shopping_id' defaultValue={ item_data.id } required/>
            <div className="modal-buttons" style={ {marginTop: 20} }>
                <Button className="bg-red" >Si, eliminar</Button>
                <Button type='submit' onClick={ handleModalClose }>Cancelar</Button>
            </div>
        </form>
    </div>
    };

    function getSupplierName(id){
        return suppliers.find( supplier => supplier.id === id).nombre;
    }

    function getProductName(id){
        return products.find( product => product.id === id).name;
    }

    function TableWraper(props) {
        let openDeleteModal = props.openDeleteModal;
        const columns = useMemo(
          () => [
            {
                Header: 'Producto',
                accessor: 'id_producto',
                Cell: props => getProductName(props.value)
            },
            {
                Header: 'Kg',
                accessor: 'kg',
                Cell: props => `${props.value} kg`
            },
            {
                Header: 'Fecha',
                accessor: 'fecha',
            },
            {
                Header: 'Proveedor',
                accessor: 'id_proveedor',
                Cell: props => getSupplierName(props.value)
            },
            {
                Header: 'Eliminar',
                accessor: 'eliminar',
                Cell: props => <Button className="bg-red" onClick={ () => openDeleteModal(props.value) }><FontAwesomeIcon icon={faTimes} /> Eliminar</Button>
            },
          ],
          []
        )
        const data = useMemo(() => tableData, [tableData]);    
        return (
            <Table columns={columns} data={data} />
        )
    }

    function Table({ columns, data }) {
        const {
          getTableProps,
          getTableBodyProps,
          headerGroups,
          rows,
          prepareRow,
        } = useTable(
          {
            columns,
            data,
          },
          useSortBy
        )
      
        // We don't want to render all 2000 rows for this example, so cap
        // it at 20 for this use case
        // const firstPageRows = rows.slice(0, 20)
      
        return (
          <>
          
            <StyledTable {...getTableProps()}>
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      // Add the sorting props to control sorting. For this example
                      // we can add them into the header props
                      <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                        {column.render('Header')}
                        {/* Add a sort direction indicator */}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? ' 🔽'
                              : ' 🔼'
                            : ''}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map(
                  (row, i) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map(cell => {
                          return (
                            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                          )
                        })}
                      </tr>
                    )}
                )}
              </tbody>
            </StyledTable>
            <br />
          </>
        )
    }

    /*
    function applyFilters(evt){
        evt.preventDefault();
        let date = evt.target.date.value;
        let supplier = evt.target.supplier.value;
        console.log(supplier);
        if(date && (supplier !== '0')){
            setTableData( shopping.filter( item => item.fecha === date && item.id_proveedor === Number(supplier) ));
            console.log('both');
        }

        else if(date){
            setTableData( shopping.filter( item => item.fecha === date));
            console.log('only date');
        }
        else if(supplier !== '0'){
            setTableData( shopping.filter( item => item.id_proveedor === Number(supplier) ));
            console.log('supplier');
        }
    }*/

    function resetFilters(){
        setTableData(shopping);
    }

    useEffect( () => {
        initialFunction();
    }, []);


    return(
        <Layout active='Compras'>
            <Container>
                { products && suppliers ?
                <>
                <h2>NUEVO COMPRA</h2>
                <form onSubmit={ createShopping }>
                    <label>
                        <p>Producto</p>
                        <select name="product_id">
                            <option value="0">Producto</option>
                            { products ? products.map(product => <option value={ product.id }> {product.name} </option>) : null}
                        </select>
                    </label>

                    <StyledInput type='text' placeholder='Kg' label='Kg' name='kg' required/>
                    <StyledInput type='date' placeholder='Fecha' label='Fecha' name='date' required/>

                    <label>
                        <p>Proveedor</p>
                        <select name="supplier_id">
                            <option value="0">Proveedor</option>
                            { suppliers ? suppliers.map(supplier => <option value={ supplier.id }> {supplier.nombre} </option>) : null}
                        </select>
                    </label>

                    <ButtonGroup>
                        <ControlButton type='submit' className="bg-primary">GUARDAR</ControlButton>
                        <ControlButton type='reset' className="bg-red" >CANCELAR</ControlButton>
                    </ButtonGroup>
                </form>

                <h2>LISTA DE COMPRAS</h2>

                <form style={ {marginBottom: 20} }>
                    <div style={ {display: 'flex', alignItems: 'center', justifyContent: 'flex-start'} }>

                        {/* <div style={ {display: 'flex'} }>
                            <Button className="bg-primary" type='submit' small>Aplicar filtros</Button>
                            <Button className="bg-red" ml type='reset' onClick={resetFilters}>Reiniciar filtos</Button>
                        </div> */}
                    </div>
                </form>


                <div style={ { overflowX: 'auto'}}>
                    {/* <TableWraper openDeleteModal={openDeleteModal} />*/}
                    
                    <StyledTable>
                        <thead>
                            <tr>
                                <td>Producto</td>
                                <td>Kg</td>
                                <td>Fecha <input style={ {fontSize: 18} } type={'date'} name='date' style={ {fontSize: 18} } onChange={ (evt) => setFilters({fecha: evt.target.value, proveedor: filters.proveedor})}/></td>
                                <td><select style={ {fontSize: 20} } name='supplier' onChange={ (evt) => setFilters({fecha: filters.fecha, proveedor: Number(evt.target.value)})}>
                                <option value="0">Proveedor</option>
                                { suppliers ? suppliers.map(supplier => <option value={ supplier.id }> {supplier.nombre} </option>) : null }
                            </select></td>
                                <td>Eliminar</td>
                            </tr>
                        </thead>

                        <tbody>
                            { tableData ? 
                                tableData.filter(item => {
                                    if(filters.fecha && filters.proveedor)
                                        return item.fecha === filters.fecha && item.id_proveedor === filters.proveedor;
                                    else if(filters.fecha && !filters.proveedor)
                                        return item.fecha === filters.fecha;
                                    else if(!filters.fecha && filters.proveedor)
                                        return item.id_proveedor === filters.proveedor;
                                    else
                                        return item;
                                    
                                }).map( (item, index) => {
                                    return <tr key={index}>
                                        <td>{ products ? products.filter( product => item.id_producto === product.id).map( product => product.name) : item.id_producto}</td>
                                        <td>{ item.kg }</td>
                                        <td>{ item.fecha }</td>
                                        <td>{ suppliers ? suppliers.filter( supplier => item.id_proveedor === supplier.id).map( supplier => supplier.nombre) : item.id_proveedor}</td>
                                        <td><Button className="bg-red" onClick={ () => openDeleteModal(item) }><FontAwesomeIcon icon={faTimes} /> Eliminar</Button> </td>
                                    </tr>
                                })
                            : null}
                        </tbody>
                    </StyledTable>
                    
                </div>
                </>
                : null }
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