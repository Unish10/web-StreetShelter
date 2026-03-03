import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        const adminData = JSON.parse(localStorage.getItem('admin'));
        
        if (!userData && !adminData) {
            navigate('/');
            return;
        }

        
        if (adminData || (userData && userData.role === 'admin')) {
            navigate('/dashboard/admin', { replace: true });
        } else if (userData && userData.role === 'owner') {
            navigate('/dashboard/owner', { replace: true });
        } else if (userData && userData.role === 'user') {
            navigate('/dashboard/reporter', { replace: true });
        }
    }, [navigate]);

    return null;
};

export default Home;
