import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

const NotFound = () => (
  <Container className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-center py-5">
    <p className="text-uppercase fw-semibold text-muted mb-2" style={{ letterSpacing: '0.1em' }}>
      Error 404
    </p>
    <h1 className="display-5 fw-bold mb-3">Page not found</h1>
    <p className="text-muted mb-4" style={{ maxWidth: 420 }}>
      The page you are looking for does not exist or has moved. Check the address, or head back to a page that does.
    </p>
    <div className="d-flex gap-2 flex-wrap justify-content-center">
      <Button as={Link} to="/" variant="dark">
        Back to home
      </Button>
      <Button as={Link} to="/dashboard" variant="outline-dark">
        Go to dashboard
      </Button>
    </div>
  </Container>
);

export default NotFound;
