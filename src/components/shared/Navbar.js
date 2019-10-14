import React from 'react'

import { useGlobalState, useDispatch } from '../../lib/globalState'

import { Button, CustomInput, Navbar, NavbarBrand, NavbarToggler, Nav, Form, UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const SuperNavbar = () => {
  const state = useGlobalState()
  const dispatch = useDispatch()

  const {user} = state

  const toggleResponsiveSidebar = () => {
    dispatch({type: 'TOGGLE_RESPONSIVE_SIDEBAR_VISIBLE'})
  }

  const activateFullscreen = () => {
    dispatch({type: 'SET_LAYOUT_MODE', layoutMode: 'fullscreen'})
  }

  return (
    <Navbar expand="md">
      <NavbarToggler onClick={() => toggleResponsiveSidebar()}><FontAwesomeIcon icon="bars"/></NavbarToggler>
      <NavbarBrand className="brand" href="/">Supernova</NavbarBrand>
      <Nav className="utility-nav ml-auto" navbar>
        <Form inline className="layout-nav">
          <CustomInput type="switch" id="layoutMode" name="layoutMode" label="Fullscreen" onClick={() => activateFullscreen()}/>
        </Form>
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav caret>
            <FontAwesomeIcon icon="user"/> {user.profile.fullName}
          </DropdownToggle>
          <DropdownMenu right className="text-muted">                  
            <span className="dropdown-item-text">{user.profile.fullName}</span>
            { user.profile.email && <span className="dropdown-item-text u-text-info">{user.profile.email}</span> }
            <span className="dropdown-item-text">Role: {user.profile.editor ? 'Editor' : 'Viewer'}</span>
          </DropdownMenu>
        </UncontrolledDropdown>
      </Nav>
    </Navbar>
  ) 
}

export default SuperNavbar