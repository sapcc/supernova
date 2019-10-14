import React from 'react'

import { useGlobalState, useDispatch } from '../../lib/globalState'

import { Button, CustomInput, Navbar, Nav, NavItem, UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap'
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
      <Button outline className="hamburger" onClick={() => toggleResponsiveSidebar()}><FontAwesomeIcon icon="bars"/></Button>
      <CustomInput type="switch" className="ml-auto" id="layoutMode" name="layoutMode" label="Fullscreen" onClick={() => activateFullscreen()}/>
      <Nav className="utility-nav" navbar>
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav caret>
            <FontAwesomeIcon icon="user"/> {user.profile.fullName}
          </DropdownToggle>
          <DropdownMenu right className="p-4 text-muted" style={{maxWidth: 200}}>
            <p>                   
              {user.profile.fullName}
              {user.profile.email && <React.Fragment><br/><span className="small">{user.profile.email}</span></React.Fragment>}
              <br/><span className="small">Role: {user.profile.editor ? 'Editor' : 'Viewer'}</span>
            </p> 
          </DropdownMenu>
        </UncontrolledDropdown>
      </Nav>
    </Navbar>
  ) 
}

export default SuperNavbar