
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeModeProvider } from "./contexts/ThemeContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Exam from "./pages/Exam";
import EditExam from "./pages/EditExam";
import CreateExam from "./pages/CreateExam";
import Results from "./pages/Results";
import MyResults from "./pages/MyResults";
import ExamList from "./pages/ExamList";
import TeacherLiveResults from "./pages/TeacherLiveResults";
import StudentExamResult from "./pages/StudentExamResult";
import Contact from "./pages/Contact";
import AdminMessages from "./pages/AdminMessages";
import AddQuestion from "./pages/AddQuestion";
import Subjects from "./pages/Subjects";
import PendingTeachers from "./pages/PendingTeachers";

function App() {

  return (

    <ThemeModeProvider>
      <Router>
        <AuthProvider>

          <Layout>

            <Routes>

              {/* PUBLIC */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* DASHBOARD */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/active"
                element={
                  <PrivateRoute>
                    <Dashboard filter="active" />
                  </PrivateRoute>
                }
              />

              <Route
                path="/upcoming"
                element={
                  <PrivateRoute>
                    <Dashboard filter="upcoming" />
                  </PrivateRoute>
                }
              />

              <Route
                path="/live"
                element={
                  <PrivateRoute>
                    <Dashboard filter="live" />
                  </PrivateRoute>
                }
              />

              <Route
                path="/history"
                element={
                  <PrivateRoute>
                    <Dashboard filter="history" />
                  </PrivateRoute>
                }
              />

              {/* CONTACT */}
              <Route
                path="/contact"
                element={
                  <PrivateRoute>
                    <Contact />
                  </PrivateRoute>
                }
              />

              {/* ADMIN MESSAGES */}
              <Route
                path="/admin/messages"
                element={
                  <PrivateRoute allowedRoles={["admin","teacher"]}>
                    <AdminMessages />
                  </PrivateRoute>
                }
              />

              {/* QUESTION BANK */}
              <Route
                path="/add-question"
                element={
                  <PrivateRoute allowedRoles={["teacher","admin"]}>
                    <AddQuestion />
                  </PrivateRoute>
                }
              />

              {/* EXAMS */}
              <Route
                path="/exam/:id"
                element={
                  <PrivateRoute>
                    <Exam />
                  </PrivateRoute>
                }
              />

              <Route
                path="/create-exam"
                element={
                  <PrivateRoute allowedRoles={["teacher","admin"]}>
                    <CreateExam />
                  </PrivateRoute>
                }
              />

              <Route
                path="/exam/edit/:id"
                element={
                  <PrivateRoute allowedRoles={["teacher","admin"]}>
                    <EditExam />
                  </PrivateRoute>
                }
              />

              {/* RESULTS */}
              <Route
                path="/exam/results/:id"
                element={
                  <PrivateRoute allowedRoles={["teacher","admin"]}>
                    <Results />
                  </PrivateRoute>
                }
              />

              <Route
                path="/exam/result/:examId"
                element={
                  <PrivateRoute allowedRoles={["student"]}>
                    <StudentExamResult />
                  </PrivateRoute>
                }
              />

              <Route
                path="/exam/results/live/:examId"
                element={
                  <PrivateRoute allowedRoles={["teacher","admin"]}>
                    <TeacherLiveResults />
                  </PrivateRoute>
                }
              />

              <Route
                path="/results"
                element={
                  <PrivateRoute allowedRoles={["student"]}>
                    <Results />
                  </PrivateRoute>
                }
              />

              <Route
                path="/my-results"
                element={
                  <PrivateRoute allowedRoles={["student"]}>
                    <MyResults />
                  </PrivateRoute>
                }
              />

              <Route
                path="/exam-list"
                element={
                  <PrivateRoute>
                    <ExamList />
                  </PrivateRoute>
                }
              />

              <Route
path="/subjects"
element={
<PrivateRoute allowedRoles={["admin","teacher"]}>
<Subjects/>
</PrivateRoute>
}
/>

<Route
path="/admin/pending-teachers"
element={
<PrivateRoute allowedRoles={["admin"]}>
<PendingTeachers/>
</PrivateRoute>
}
/>


              <Route path="*" element={<Navigate to="/" />} />

            </Routes>

          </Layout>

        </AuthProvider>
      </Router>
    </ThemeModeProvider>

  );

}

export default App;
