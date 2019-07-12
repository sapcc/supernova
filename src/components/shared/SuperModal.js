import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'


const SuperModal = ({ isShowing, hide, size, header, footer, cancelButtonText, children }) => isShowing ? ReactDOM.createPortal(
    <React.Fragment>
        {/* <div className="modal-overlay"/> */}
        <Modal isOpen={isShowing} toggle={hide} className="main-modal" size={size ? size : "xl"} scrollable={true}>
            <ModalHeader toggle={hide}>{header}</ModalHeader>
            <ModalBody>
                {children}
            </ModalBody>
            <ModalFooter>
                {footer}
                {/* <Button color="primary" onClick={this.toggle}>Do Something</Button>{' '} */}
                <Button color="secondary" onClick={hide}>{cancelButtonText ? cancelButtonText : "Cancel"}</Button>
            </ModalFooter>
        </Modal>
    </React.Fragment>, document.body
) : null

export default SuperModal