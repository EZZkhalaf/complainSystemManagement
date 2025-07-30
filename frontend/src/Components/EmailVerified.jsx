import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../Context/authContext';

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {setUserNewData} = useAuthContext()
  const navigate = useNavigate();
  const location = useLocation();

    const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const getTokenFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get("token");
  };
  useEffect(() => {
    const token = getTokenFromUrl();
    if (!token) {
      setError("No verification token found.");
      setLoading(false);
      return;
    }

    // Call backend to verify email update and get updated user data
    fetch(`http://localhost:5000/api/user/verify-email?token=${token}`)
      .then(res => {
        if (!res.ok) throw new Error("Verification failed");
        return res.json();
      })
      .then(data => {
        if (data.success && data.newUser) {
          setUserNewData(data.newUser); // update context & localStorage
          setLoading(false);
          // Optionally redirect after a delay or show success message
          // navigate("/dashboard");
        } else {
          throw new Error(data.message || "Verification failed");
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [location.search, setUserNewData, navigate]);
  if (loading) return <div>Verifying your email, please wait...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div>
      <h1>Email Verified Successfully!</h1>
      <p>You can now continue using your updated email.</p>
      {/* You can add buttons to go somewhere else */}
    </div>
  );
};

export default EmailVerified;
