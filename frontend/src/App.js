import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [spaces, setSpaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [authData, setAuthData] = useState({ name: '', email: '', password: '', role: 'user' });

  // Booking & Dashboard States
  const [showModal, setShowModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ date: '', startTime: '', endTime: '' });
  const [showDashboard, setShowDashboard] = useState(false);
  const [myBookings, setMyBookings] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Meeting Room',
    pricePerHour: '',
    isAvailable: true
  });

  const fetchSpaces = () => {
    axios.get('http://localhost:5000/api/spaces/all')
      .then(res => setSpaces(res.data))
      .catch(err => console.error("Error:", err));
  };

  // বুকিং ডাটা নিয়ে আসার ফাংশন
  const fetchBookings = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('nexusUser'));
    const uId = loggedInUser.id || loggedInUser._id;
    
    // যদি অ্যাডমিন হয় তবে সব বুকিং আনবে, নাহলে শুধু ইউজারের বুকিং
    const url = loggedInUser.role === 'admin' 
      ? `http://localhost:5000/api/bookings/all` 
      : `http://localhost:5000/api/bookings/user/${uId}`;

    axios.get(url)
      .then(res => setMyBookings(res.data))
      .catch(err => console.error("Dashboard Error:", err));
  };

  useEffect(() => {
    fetchSpaces();
    const savedUser = localStorage.getItem('nexusUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (showDashboard) fetchBookings();
  }, [showDashboard]);

  // --- Auth Functions ---
  const handleAuthChange = (e) => setAuthData({ ...authData, [e.target.name]: e.target.value });
  
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const url = isSignup ? 'register' : 'login';
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/${url}`, authData);
      if (!isSignup) {
        const userData = res.data.user; 
        localStorage.setItem('nexusUser', JSON.stringify(userData));
        setUser(userData);
        setIsLoggedIn(true);
        alert(`Welcome back, ${userData.name}!`);
      } else {
        alert("Registration Successful! Please Login.");
        setIsSignup(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Auth Error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nexusUser');
    setIsLoggedIn(false);
    setUser(null);
    setShowDashboard(false);
  };

  // --- Booking Logic ---
  const openBookingModal = (space) => {
    setSelectedSpace(space);
    setShowModal(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const loggedInUser = JSON.parse(localStorage.getItem('nexusUser'));

    const finalBooking = {
      spaceId: selectedSpace._id,
      userId: loggedInUser.id || loggedInUser._id, 
      spaceName: selectedSpace.name,
      userName: loggedInUser.name,
      ...bookingDetails
    };

    axios.post('http://localhost:5000/api/bookings/add', finalBooking)
      .then(res => {
        alert("Booking Confirmed! ");
        setShowModal(false);
        setBookingDetails({ date: '', startTime: '', endTime: '' });
        fetchSpaces(); // স্পেস লিস্ট রিফ্রেশ (অ্যাভেইলিবিলিটি আপডেট দেখানোর জন্য)
      })
      .catch(err => {
        alert(err.response?.data?.message || "Booking Failed");
      });
  };

  // --- Admin Logic ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    const request = editingId 
      ? axios.put(`http://localhost:5000/api/spaces/${editingId}`, formData)
      : axios.post('http://localhost:5000/api/spaces/add', formData);

    request.then(() => {
      alert(editingId ? "Space Updated! " : "Space Added! ");
      setEditingId(null);
      setFormData({ name: '', type: 'Meeting Room', pricePerHour: '', isAvailable: true });
      fetchSpaces();
    });
  };

  const handleEdit = (space) => {
    setEditingId(space._id);
    setFormData({ name: space.name, type: space.type, pricePerHour: space.pricePerHour, isAvailable: space.isAvailable });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this space?")) {
      axios.delete(`http://localhost:5000/api/spaces/${id}`).then(() => fetchSpaces());
    }
  };

  const filteredSpaces = spaces.filter(space =>
    space.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Styles
  const containerStyle = { padding: '60px 20px', fontFamily: "'Inter', sans-serif", backgroundColor: '#0f141e', minHeight: '100vh', color: '#ececec' };
  const headerStyle = { textAlign: 'center', marginBottom: '40px' };
  const titleStyle = { fontSize: '2.5rem', fontWeight: '800', margin: '0', color: '#ffffff' };
  const searchWrapperStyle = { display: 'flex', justifyContent: 'center', marginBottom: '40px' };
  const searchInputStyle = { width: '100%', maxWidth: '400px', padding: '12px 20px', borderRadius: '30px', border: '1px solid #2d3436', backgroundColor: '#1a1f2b', color: '#fff', outline: 'none' };
  const formWrapperStyle = { display: 'flex', justifyContent: 'center', marginBottom: '60px' };
  const formCardStyle = { background: 'linear-gradient(145deg, #1a1f2b, #232a3b)', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.05)' };
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
  const inputRowStyle = { display: 'flex', gap: '10px' };
  const inputStyle = { padding: '14px', borderRadius: '10px', border: '1px solid #2d3436', backgroundColor: '#0f141e', color: '#fff', outline: 'none', width: '100%' };
  const selectStyle = { padding: '14px', borderRadius: '10px', border: '1px solid #2d3436', backgroundColor: '#0f141e', color: '#fff', outline: 'none', flex: '1' };
  const numberInputStyle = { padding: '14px', borderRadius: '10px', border: '1px solid #2d3436', backgroundColor: '#0f141e', color: '#fff', outline: 'none', flex: '1' };
  const addButtonStyle = { backgroundColor: '#00b894', color: '#fff', padding: '15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' };
  const updateButtonStyle = { backgroundColor: '#f1c40f', color: '#000', padding: '15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' };
  const cancelButtonStyle = { backgroundColor: 'transparent', color: '#e17055', border: 'none', cursor: 'pointer', marginTop: '10px' };
  const gridStyle = { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' };
  const cardStyle = { backgroundColor: '#1a1f2b', padding: '25px', borderRadius: '20px', width: '280px', border: '1px solid rgba(255,255,255,0.03)' };
  const cardTitleStyle = { color: '#fff', fontSize: '1.2rem', marginBottom: '5px' };
  const priceTextStyle = { fontSize: '1.1rem', fontWeight: '700', color: '#a7ef55ff', marginBottom: '15px' };
  const badgeStyle = { fontSize: '0.6rem', backgroundColor: '#2d3436', padding: '3px 8px', borderRadius: '10px', color: '#b2bec3', float: 'right' };
  const btnGroupStyle = { display: 'flex', gap: '10px' };
  const editButtonStyle = { flex: 1, backgroundColor: '#676372ff', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' };
  const deleteButtonStyle = { flex: 1, backgroundColor: 'transparent', color: '#e17055', border: '1px solid #e17055', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' };
  const bookButtonStyle = { width: '100%', padding: '12px', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', fontSize: '0.9rem', marginBottom: '10px', cursor: 'pointer' };
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };

  if (!isLoggedIn) {
    return (
        <div style={containerStyle}>
          <div style={formWrapperStyle}>
            <div style={formCardStyle}>
              <h2 style={{ color: '#fff', textAlign: 'center' }}>{isSignup ? "Create Account" : "Nexus Login"}</h2>
              <form onSubmit={handleAuthSubmit} style={formStyle}>
                {isSignup && <input name="name" placeholder="Full Name" onChange={handleAuthChange} style={inputStyle} required />}
                <input name="email" type="email" placeholder="Email Address" onChange={handleAuthChange} style={inputStyle} required />
                <input name="password" type="password" placeholder="Password" onChange={handleAuthChange} style={inputStyle} required />
                {isSignup && (
                  <select name="role" onChange={handleAuthChange} style={selectStyle}>
                    <option value="user">I am a User</option>
                    <option value="admin">I am an Admin</option>
                  </select>
                )}
                <button type="submit" style={addButtonStyle}>{isSignup ? "SIGN UP" : "LOGIN"}</button>
              </form>
              <p onClick={() => setIsSignup(!isSignup)} style={{ color: '#55efc4', cursor: 'pointer', textAlign: 'center', marginTop: '15px' }}>
                {isSignup ? "Already have an account? Login" : "New here? Create an account"}
              </p>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div style={containerStyle}>
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={formCardStyle}>
            <h2 style={{color: '#fff'}}>Book {selectedSpace?.name}</h2>
            <form onSubmit={handleBookingSubmit} style={formStyle}>
              <label style={{fontSize: '0.8rem'}}>Select Date</label>
              <input type="date" required style={inputStyle} value={bookingDetails.date} onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})} />
              <div style={inputRowStyle}>
                <div>
                  <label style={{fontSize: '0.8rem'}}>Start Time</label>
                  <input type="time" required style={inputStyle} value={bookingDetails.startTime} onChange={(e) => setBookingDetails({...bookingDetails, startTime: e.target.value})} />
                </div>
                <div>
                  <label style={{fontSize: '0.8rem'}}>End Time</label>
                  <input type="time" required style={inputStyle} value={bookingDetails.endTime} onChange={(e) => setBookingDetails({...bookingDetails, endTime: e.target.value})} />
                </div>
              </div>
              <button type="submit" style={addButtonStyle}>CONFIRM SLOT</button>
              <button type="button" onClick={() => setShowModal(false)} style={cancelButtonStyle}>Close</button>
            </form>
          </div>
        </div>
      )}

      <div style={headerStyle}>
        <h1 style={titleStyle}>Nexus <span style={{color: '#55efc4'}}>Elite</span></h1>
        <p>
            Logged in as: <b>{user.name}</b> ({user.role}) | 
            <span onClick={() => setShowDashboard(!showDashboard)} style={{color: '#55efc4', cursor: 'pointer', marginLeft: '10px'}}>
                {showDashboard ? " View Spaces" : user.role === 'admin' ? " All Bookings" : " My Bookings"}
            </span> | 
            <span onClick={handleLogout} style={{color: '#e17055', cursor: 'pointer', marginLeft: '10px'}}>Logout</span>
        </p>
      </div>

      {!showDashboard ? (
        <>
          <div style={searchWrapperStyle}>
        
        <p style={{ fontSize: '0.8rem', color: '#b2bec3', marginBottom: '8px' }}>
            Try searching: <span style={{color: '#55efc4'}}>Meeting Room</span>, 
            <span style={{color: '#55efc4'}}>Private Office</span>, or 
            <span style={{color: '#55efc4'}}>Open Desk</span>
        </p>
              <input type="text" placeholder="Search spaces..." style={searchInputStyle} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {user.role === 'admin' && (
            <div style={formWrapperStyle}>
              <div style={formCardStyle}>
                <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.2rem' }}>
                  {editingId ? " Update Space" : "+ Create New Listing"}
                </h2>
                <form onSubmit={handleSubmit} style={formStyle}>
                  <input name="name" placeholder="Space Name" value={formData.name} onChange={handleChange} required style={inputStyle} />
                  <div style={inputRowStyle}>
                    <select name="type" value={formData.type} onChange={handleChange} style={selectStyle}>
                      <option value="Meeting Room">Meeting Room</option>
                      <option value="Private Office">Private Office</option>
                      <option value="Desk">Open Desk</option>
                    </select>
                    <input name="pricePerHour" type="number" placeholder="BDT/hr" value={formData.pricePerHour} onChange={handleChange} required style={numberInputStyle} />
                  </div>
                  <button type="submit" style={editingId ? updateButtonStyle : addButtonStyle}>
                    {editingId ? "CONFIRM UPDATE" : "DEPLOY SPACE"}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div style={gridStyle}>
              {filteredSpaces.map((space) => (
              <div key={space._id} style={cardStyle}>
                  <div style={badgeStyle}>{space.type}</div>
                  <h2 style={cardTitleStyle}>{space.name}</h2>
                  <p style={priceTextStyle}>BDT {space.pricePerHour} <span style={{fontSize: '0.8rem', color: '#636e72'}}>/ hr</span></p>
                  
                  {/* বাটন পরিবর্তন লজিক */}
                  <div style={{ marginBottom: '15px' }}>
                    {space.isAvailable ? (
                        <button onClick={() => openBookingModal(space)} style={{ ...bookButtonStyle, backgroundColor: '#00b894' }}>
                             BOOK NOW
                        </button>
                    ) : (
                        <button disabled style={{ ...bookButtonStyle, backgroundColor: '#636e72', cursor: 'not-allowed' }}>
                             ALREADY BOOKED
                        </button>
                    )}
                  </div>

                  {user.role === 'admin' && (
                  <div style={btnGroupStyle}>
                      <button onClick={() => handleEdit(space)} style={editButtonStyle}>EDIT</button>
                      <button onClick={() => handleDelete(space._id)} style={deleteButtonStyle}>DELETE</button>
                  </div>
                  )}
              </div>
              ))}
          </div>
        </>
      ) : (
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
            <h2 style={{textAlign: 'center', color: '#55efc4'}}>{user.role === 'admin' ? "System Management: All Reservations" : "Your Reservations"}</h2>
            {myBookings.length === 0 ? <p style={{textAlign: 'center'}}>No bookings found.</p> : (
                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', backgroundColor: '#1a1f2b', borderRadius: '15px', padding: '10px', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{borderBottom: '1px solid #2d3436', textAlign: 'left', color: '#b2bec3'}}>
                                <th style={{padding: '15px'}}>Space Name</th>
                                {user.role === 'admin' && <th style={{padding: '15px'}}>User Name</th>}
                                <th style={{padding: '15px'}}>Date</th>
                                <th style={{padding: '15px'}}>Time Slot</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myBookings.map(b => (
                                <tr key={b._id} style={{borderBottom: '1px solid #2d3436'}}>
                                    <td style={{padding: '15px'}}>{b.spaceName}</td>
                                    {user.role === 'admin' && <td style={{padding: '15px', color: '#55efc4'}}>{b.userName}</td>}
                                    <td style={{padding: '15px'}}>{b.date}</td>
                                    <td style={{padding: '15px'}}>{b.startTime} - {b.endTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

export default App;