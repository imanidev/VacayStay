import { useSelector } from "react-redux";
export default function Homepage() {
  const sessionUser = useSelector((state) => state.session.user);
  return (
    <header>
      <h1>{sessionUser ? `Welcome, ${sessionUser.firstName}!` : "Welcome!"}</h1>
    </header>
  );
}
