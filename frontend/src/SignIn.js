import GoogleButton from 'react-google-button'

function SignIn(props) {
  return (
    <GoogleButton
      onClick={props.onClick}
    />
  );
}

export default SignIn;
