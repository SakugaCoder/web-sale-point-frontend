import styled from "styled-components";
import SidebarItem from "./SidebarItem";


import { 
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
    height: 100vh;
    // display: fixed;
`;

const SidebarLogo = styled.div`
    font-size: 2rem;
    letter-spacing: 1rem;
    text-align: center;
    margin-bottom: 40px;
`;

export default function Sidebar(){
    const user_menu = [
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
            name: 'Ayudantes',
            href: '/ayudantes',
            icon: faHandsHelping,
            submenu: false
        },
        {
            name: 'Proveedor',
            href: '/proveedor',
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
                LOGO
            </SidebarLogo>
            { user_menu.map( (item,index) => <SidebarItem name={ item.name } href={ item.href } icon={ item.icon } key={index}  />) }
        </SidebarContainer>
    );
}