import Layout from "../components/Layout.";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPen } from "@fortawesome/free-solid-svg-icons";
import StyledInput from "../components/Input/Input";
import Button from "../components/Button";
import { SP_API } from "../utils/SP_APPI";

import { useState, useEffect, useMemo} from 'react';
import { useTable, useSortBy } from 'react-table';
import { getItems, updateItem, deleteItem, insertItem } from "../utils/SP_APPI";
import Modal from "../components/Modal/Modal";
import useModal from "../hooks/useModal";

const Container = styled.div`
    padding: 20px;
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
    const [ errorMsj, setErrorMsj ] = useState('');
    const [filters, setFilters] = useState({fecha: null, proveedor: null, producto: null});
    const [ currentDate, setCurrentDate ] = useState('');

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

        let res_date = await SP_API('http://localhost:3002/date', 'GET');
        setCurrentDate(res_date);
        console.log(res_date);
    };

    const createShopping = async evt =>{
        setErrorMsj('');
        evt.preventDefault();
        let data = {
            product_id: Number(evt.target.product_id.value),
            kg: evt.target.kg.value,
            date: evt.target.date.value,
            supplier_id: Number(evt.target.supplier_id.value),
            costo: Number(evt.target.costo.value),
            es_retiro: evt.target.es_retiro.checked,
        };



        if(data.product_id && data.kg && data.date && data.supplier_id && data.costo){
            let detalle_proveedor = suppliers.find( supplier => supplier.id === Number(evt.target.supplier_id.value) );
            let detalle_producto = products.find( product => product.id === Number(evt.target.product_id.value));

            data.detalle_proveedor = detalle_proveedor;
            data.detalle_producto = detalle_producto;

            console.log(data);
            
            let res = await insertItem('compra', data);
            if(res.err === false){
                evt.target.reset(); 
                initialFunction();   
            }

            else{
                alert('Error al actualizar compra');
            }
            return;
        }

        setErrorMsj('Error. Favor de completar todos los campos.');


    };

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

    function resetFilters(){
        setTableData(shopping);
    }

    function filterData(){
        return tableData.filter( item => {
            // Filter by date
            if(filters.fecha)
                return item.fecha === filters.fecha;
            else
                return item;	
        }).
        filter( item => {
            // Filter by client
            if(filters.producto)
                if(filters.producto !== 0)
                    return filters.producto === item.id_producto
            return item;
        }).
        filter( item => {
            // Filter by status
            if(filters.proveedor)
                if(filters.proveedor !== 0)
                    return Number(filters.proveedor) === item.id_proveedor;
            return item;
        });
    }

    useEffect( () => {
        initialFunction();
    }, []);


    return(
        <Layout active='Compras'>
            <Container>
                { products && suppliers ?
                <>
                <h2>NUEVA COMPRA</h2>
                <form onSubmit={ createShopping }>
                    <div style={ {display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap'} }>
                        <label>
                            <p>Producto</p>
                            <select name="product_id">
                                <option value="0">Seleccionar producto</option>
                                { products ? products.map(product => <option value={ product.id }> {product.name} </option>) : null}
                            </select>
                        </label>

                        <StyledInput type='text' placeholder='Kg' label='Kg' name='kg' required maxWidth='300px'/>
                        <StyledInput type='date' placeholder='Fecha' label='Fecha' name='date' required maxWidth='300px' defaultValue={ currentDate ? currentDate.date : null }/>

                        <label>
                            <p>Proveedor</p>
                            <select name="supplier_id">
                                <option value="0">Proveedor</option>
                                { suppliers ? suppliers.filter( s => s.id !== 4).map(supplier => <option value={ supplier.id }> {supplier.nombre} </option>) : null}
                            </select>
                        </label>

                        <StyledInput type='text' placeholder='Costo' label='Costo' name='costo' required maxWidth='300px'/>

                        <label>
                            <p>Agregar como retiro</p>
                            <input type={'checkbox'} name="es_retiro" style={ {width: 30, height: 30, border: 'solid 2px #000'} } />
                        </label>
                    </div>
                    <p className="error-msj">{ errorMsj }</p>

                    <ButtonGroup>
                        <ControlButton type='submit' className="bg-primary">GUARDAR</ControlButton>
                        <ControlButton type='reset' className="bg-red" >CANCELAR</ControlButton>
                    </ButtonGroup>
                </form>

                <div style={ {display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '40px'} }>
                    <h2>LISTA DE COMPRAS</h2>
                    <Button className='bg-red' onClick={ () => window.location.reload() }>REINICIAR FILTROS</Button>
                </div>
                


                <div style={ { overflowX: 'auto', marginTop: 20}}>
                    {/* <TableWraper openDeleteModal={openDeleteModal} />*/}
                    
                    <StyledTable>
                        <thead>
                            <tr>
                                <td><select style={ {fontSize: 20} } name='supplier' onChange={ (evt) => setFilters({fecha: filters.fecha, proveedor: filters.proveedor, producto: Number(evt.target.value)})}>
                                    <option value="0">Producto</option>
                                    { products ? products.map(producto => <option value={ producto.id }> {producto.name} </option>) : null }
                                </select></td>

                                <td>Kg</td>
                                <td><input style={ {fontSize: 18} } type={'date'} name='date' onChange={ (evt) => setFilters({fecha: evt.target.value, proveedor: filters.proveedor, producto: filters.producto})}/></td>
                                <td>
                                    <select style={ {fontSize: 20} } name='supplier' onChange={ (evt) => setFilters({fecha: filters.fecha, proveedor: Number(evt.target.value), producto: filters.producto })}>
                                        <option value="0">Proveedor</option>
                                        { suppliers ? suppliers.filter( s => s.id !== 4).map(supplier => <option value={ supplier.id }> {supplier.nombre} </option>) : null }
                                    </select>
                                </td>
                                <td>Costo</td>
                                <td></td>
                            </tr>
                        </thead>

                        <tbody>
                            { tableData ? 
                               filterData().filter(item => item.id_proveedor !== 4).map( (item, index) => {
                                    return <tr key={index}>
                                        <td>{ products ? products.filter( product => item.id_producto === product.id).map( product => product.name) : item.id_producto}</td>
                                        <td>{ item.kg }</td>
                                        <td>{ item.fecha }</td>
                                        <td>{ suppliers ? suppliers.filter( supplier => item.id_proveedor === supplier.id).map( supplier => supplier.nombre) : item.id_proveedor}</td>
                                        <td>${ item.costo }</td>
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
                            font-size: 24px;
                        }

                        input,select{
                            font-size: 24px;
                        }

                        select{
                            padding: 5px;
                        }

                        .error-msj{
                            font-size: 22px;
                            color: red;
                            font-weight: 700;
                        }
                    `
                }
            </style>

        </Layout>
    );
}