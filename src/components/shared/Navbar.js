import React from "react"

import { useGlobalState, useDispatch } from "../../lib/globalState"

import {
  Button,
  CustomInput,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Nav,
  Form,
  FormGroup,
  Input,
  Label,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
} from "reactstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import NewPreemptiveSilenceForm from "../silences/NewPreemptiveSilenceForm"

const SuperNavbar = React.memo(({ showModal }) => {
  const state = useGlobalState()
  const dispatch = useDispatch()
  const { contactList } = state

  const { user, layout } = state

  const toggleResponsiveSidebar = () => {
    dispatch({ type: "TOGGLE_RESPONSIVE_SIDEBAR_VISIBLE" })
  }

  const toggleContactsList = () => {
    dispatch({ type: "TOGGLE_CONTACTS_LIST_VISIBLE" })
  }

  const activateFullscreen = () => {
    dispatch({ type: "SET_LAYOUT_MODE", layoutMode: "fullscreen" })
  }

  const setDisplayMode = (mode) => {
    dispatch({ type: "SET_DISPLAY_MODE", display: mode })
  }

  // opens a modal window with silence form
  const createSilence = React.useCallback(() => {
    showModal({
      header: (
        <span className="u-text-info">
          Schedule Silence for Maintenance Window
        </span>
      ),
      content: NewPreemptiveSilenceForm,
    })
  }, [showModal])

  return (
    <Navbar expand="md">
      <NavbarToggler onClick={() => toggleResponsiveSidebar()}>
        <FontAwesomeIcon icon="bars" />
      </NavbarToggler>
      <NavbarBrand className="brand" href="/">
        Supernova
      </NavbarBrand>
      <Nav className="utility-nav ml-auto" navbar>
        <button
          className="btn btn-link float-right nav-support-link"
          onClick={createSilence}
        >
          <FontAwesomeIcon icon="tools" />
          Schedule Maintenance
        </button>

        {contactList.contacts &&
          Object.entries(contactList.contacts).length > 0 && (
            <Button
              color="link"
              onClick={() => toggleContactsList()}
              test={console.log(":::::::::::::", contactList)}
            >
              <FontAwesomeIcon icon="ambulance" />
              <span className="nav-support-link">
                {layout.contactsListVisible ? "Hide " : "Show "}
                Support Contacts
              </span>
            </Button>
          )}
        <Form inline className="layout-nav">
          <FormGroup>
            <CustomInput
              type="switch"
              id="layoutMode"
              name="layoutMode"
              label="Fullscreen"
              onClick={() => activateFullscreen()}
            />
          </FormGroup>
          <FormGroup>
            <Label for="displayMode">Display</Label>
            <Input
              type="select"
              name="displayMode"
              id="displayMode"
              value={layout.display}
              onChange={(e) => setDisplayMode(e.target.value)}
            >
              {["dashboard", "overview", "map"].map((mode) => (
                <option value={mode} key={mode}>
                  {mode}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Form>
        <UncontrolledDropdown nav inNavbar className="user-profile-nav">
          <DropdownToggle nav caret>
            <FontAwesomeIcon icon="user" /> {user.profile.fullName}
          </DropdownToggle>
          <DropdownMenu right className="text-muted">
            <span className="dropdown-item-text">{user.profile.fullName}</span>
            {user.profile.email && (
              <span className="dropdown-item-text u-text-info">
                {user.profile.email}
              </span>
            )}
            <span className="dropdown-item-text">
              Role: {user.profile.editor ? "Editor" : "Viewer"}
            </span>
          </DropdownMenu>
        </UncontrolledDropdown>
      </Nav>
    </Navbar>
  )
})

export default SuperNavbar
