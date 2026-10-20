import { useNavigate } from 'react-router-dom';
import AuthScreen from './AuthScreen';

export default function Login(props) {
  const navigate = useNavigate();

  return (
    <AuthScreen
      {...props}
      isSigningUp={false}
      onToggleMode={() => navigate('/register')}
    />
  );
}
