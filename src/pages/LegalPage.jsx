import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';

const LegalPage = ({ title, updated, intro, sections }) => (
  <Container className="py-5" style={{ maxWidth: 780 }}>
    <nav className="mb-4 small">
      <Link to="/">Home</Link>
      <span className="text-muted mx-2">/</span>
      <span className="text-muted">{title}</span>
    </nav>

    <h1 className="fw-bold mb-1">{title}</h1>
    <p className="text-muted small mb-4">Last updated: {updated}</p>
    <p className="lead mb-4">{intro}</p>

    {sections.map((section) => (
      <section key={section.heading} className="mb-4">
        <h2 className="h5 fw-semibold">{section.heading}</h2>
        {section.body.map((paragraph) => (
          <p key={paragraph} className="mb-2">{paragraph}</p>
        ))}
      </section>
    ))}

    <hr className="my-4" />
    <p className="small text-muted mb-0">
      Questions? Contact <a href="mailto:support@zurichbank.example">support@zurichbank.example</a>.
    </p>
  </Container>
);

LegalPage.propTypes = {
  title: PropTypes.string.isRequired,
  updated: PropTypes.string.isRequired,
  intro: PropTypes.string.isRequired,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      heading: PropTypes.string.isRequired,
      body: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
};

export default LegalPage;
