import React from 'react';
import firebase,{auth} from '../firebase/config';
import { addDocument, generateKeywords } from '../firebase/service';
import { Button, Col, Row, Typography } from 'antd';

const { Title } = Typography;

const fbProvider = new firebase.auth.FacebookAuthProvider();
const googleProvider = new firebase.auth.GoogleAuthProvider();

export default function Login() {
  const handleLogin = async (provider) => {
    const { additionalUserInfo, user } = await auth.signInWithPopup(provider);
    document.body.style.overflow = "hidden";
    if (additionalUserInfo?.isNewUser) {
      addDocument('users', {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
        providerId: additionalUserInfo.providerId,
        keywords: generateKeywords(user.displayName?.toLowerCase()),
      });
    }
  };

  return (
    <div style={{marginTop: "60px", justifyContent:"center"}}>
      <Row justify='center' style={{ height: 800 }}>
        <Col span={8}>
          <Title style={{ textAlign: 'center' }} level={3}>
            AUTHENTICATION
          </Title>
          <Button
            style={{ width: '100%', marginBottom: 5 }}
            onClick={() => handleLogin(googleProvider)}
          >
            Login with Google
          </Button>
          <Button
            style={{ width: '100%' }}
            onClick={() => handleLogin(fbProvider)}
          >
            Login with Facebook
          </Button>
        </Col>
      </Row>
    </div>
  );
}
