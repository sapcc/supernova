import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

const isFunction = (functionToCheck) => 
  functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
;

const SuperModal = ({ isShowing, hide, size, header, footer, cancelButtonText, body, children }) => ReactDOM.createPortal(
    <React.Fragment>
        {/* <div className="modal-overlay"/> */}
        <Modal isOpen={isShowing} toggle={hide} className="main-modal" size={size === 'default' ? null : size || "xl"} scrollable={true}>
          <ModalHeader toggle={hide}>{header}</ModalHeader>
          {/*if children is defined then render children as content.
             Pass Body and Footer to the children if children is a function.
          */}
          {children 
            ? (isFunction(children) ? children({Body: ModalBody, Buttons: ModalFooter, hide}) : children)
            : <React.Fragment>
                <ModalBody>
                  {body}
                </ModalBody>
                {footer !== false &&
                  <ModalFooter>
                    {/* <Button color="primary" onClick={this.toggle}>Do Something</Button>{' '} */}
                    {footer === undefined
                      ? <Button color="secondary" onClick={hide}>{cancelButtonText ? cancelButtonText : "Cancel"}</Button>
                      : isFunction(footer) ? footer({hide}) : footer
                    }
                  </ModalFooter>
                }
              </React.Fragment> 
          } 
        </Modal>
    </React.Fragment>, document.body
)

export default SuperModal