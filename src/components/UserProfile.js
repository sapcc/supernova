import React from 'react'

const styles = {
  profileContainer: {
    display: 'flex', 
    alignItems: 'center', 
    padding: 10, 
    marginBottom: 20, 
    color: '#fff'
  },
  avatar: {
    flex: '0 0 auto', 
    marginRight: 15, 
    borderRadius: '10%',
    border: 'solid 2px #ddd'
  },
  wellcome: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: 0,
    fontSize: 17,
    lineHeight: 1.3
  },
  userName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: 0
  }
}
export default ({user}) => {
  return (
    <div style={styles.profileContainer}>
      <img style={styles.avatar} src={`https://avatars.wdf.sap.corp/avatar/${user.id}?size=48x48`} alt="User Image"/>
      <div>
        <p style={styles.userName}>{user.fullName || user.id}</p>
        <p style={styles.userName}>{user.editor ? 'Editor': 'Viewer'}</p>
      </div>
    </div>
  )
}