import styled from "styled-components";
import SidebarItem from "./SidebarItem";


import { 
    faTh,
    faClipboardList,
    faClipboardCheck,
    faBoxes,
    faUserTie,
    faCashRegister,
    faShoppingBasket,
    faHandsHelping,
    faUserCog,
} from "@fortawesome/free-solid-svg-icons";

const SidebarContainer = styled.div`
    background-color: #CFDFE3;
    max-width: 280px;
    width: 100%;
    padding-top: 20px;
    height: 100%;
    position: fixed;
    overflow-y: scroll;
`;

const SidebarLogo = styled.div`
    font-size: 2rem;
    letter-spacing: 1rem;
    text-align: center;
    margin-bottom: 40px;
`;

export default function Sidebar(props){
    console.log(Number(props.rol) === 1);
    const user_menu = [
        {
            name: 'Inicio',
            href: '/inicio',
            icon: faTh,
            submenu: false,
            admin: false
        },
        {
            name: 'Pedidos',
            href: '/pedidos',
            icon: faClipboardCheck,
            submenu: false,
            admin: false
        },
        {
            name: 'Productos',
            href: '/productos',
            icon: faBoxes,
            submenu: false,
            admin: false
        },
        {
            name: 'Clientes',
            href: '/clientes',
            icon: faUserTie,
            submenu: false,
            admin: false
        },
        /*{
            name: 'Envios',
            href: '/envios',
            icon: faShippingFast,
            submenu: false,
            admin: true
        },*/
        {
            name: 'Compras',
            href: '/compras',
            icon: faShoppingBasket,
            submenu: false,
            admin: true
        },
        {
            name: 'Chalanes',
            href: '/chalanes',
            icon: faHandsHelping,
            submenu: false,
            admin: true
        },
        {
            name: 'Proveedores',
            href: '/proveedores',
            icon: faBoxes,
            submenu: false,
            admin: true
        },
        {
            name: 'Usuarios',
            href: '/usuarios',
            icon: faUserCog,
            submenu: false,
            admin: true
        },
        {
            name: 'Caja',
            href: '/caja',
            icon: faCashRegister,
            submenu: false,
            admin: false
        },
        {
            name: 'Inventario',
            href: '/inventario',
            icon: faClipboardList,
            submenu: false,
            admin: true
        }
    ];


    return(
        <SidebarContainer>
            <SidebarLogo>
                PVOL
            </SidebarLogo>
            { Number(props.rol) === 1 
            ?
                user_menu.map( (item,index) => <SidebarItem active={props.active ===  item.name ? true : false} name={ item.name } href={ item.href } icon={ item.icon } key={index}  />) 
            :
                (user_menu.filter( item => !item.admin)).map( (item,index) => <SidebarItem className={props.active ===  item.name ? true : false} name={ item.name } href={ item.href } icon={ item.icon } key={index}  />) 
            }

            <style>
                {
                    `
                        .sidebar-item-active{
                            background-color: red;
                        }
                    `
                }
            </style>
        </SidebarContainer>
    );
}