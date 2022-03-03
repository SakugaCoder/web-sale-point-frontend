import styled from "styled-components";
import SidebarItem from "./SidebarItem";


import { 
    faTh,
    faClipboardList,
    faBoxes,
    faUserTie,
    faShippingFast,
    faShoppingBasket,
    faHandsHelping,
    faUserCog
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
    const user_menu = [
        {
            name: 'Inicio',
            href: '/inicio',
            icon: faTh,
            submenu: false
        },
        {
            name: 'Pedidos',
            href: '/pedidos',
            icon: faClipboardList,
            submenu: false
        },
        {
            name: 'Productos',
            href: '/productos',
            icon: faBoxes,
            submenu: false
        },
        {
            name: 'Clientes',
            href: '/clientes',
            icon: faUserTie,
            submenu: false
        },
        {
            name: 'Envios',
            href: '/envios',
            icon: faShippingFast,
            submenu: false
        },
        {
            name: 'Compras',
            href: '/compras',
            icon: faShoppingBasket,
            submenu: false
        },
        {
            name: 'Chalanes',
            href: '/chalanes',
            icon: faHandsHelping,
            submenu: false
        },
        {
            name: 'Proveedores',
            href: '/proveedores',
            icon: faBoxes,
            submenu: false
        },
        {
            name: 'Usuarios',
            href: '/usuarios',
            icon: faUserCog,
            submenu: false
        },
    ];

    return(
        <SidebarContainer>
            <SidebarLogo>
                PVOL
            </SidebarLogo>
            { user_menu.map( (item,index) => <SidebarItem className={props.active ===  item.name ? 'sidebar-item-active' : ''} name={ item.name } href={ item.href } icon={ item.icon } key={index}  />) }
        </SidebarContainer>
    );
}