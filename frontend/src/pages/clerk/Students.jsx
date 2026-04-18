import React from 'react';
import StudentManagement from '../admin/StudentManagement';

const ClerkStudents = () => (
    <StudentManagement
        showRegistrationQueue={false}
        addButtonLabel="Register New Student"
        addModalTitle="Register New Student"
        addSuccessMessage="Student registration request submitted for Admin approval."
    />
);

export default ClerkStudents;
