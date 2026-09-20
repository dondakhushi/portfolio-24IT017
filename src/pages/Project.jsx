import "./Project.css";
import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

function Project() {
  const itemsPerPage = 3;

  const [currentPage, setCurrentPage] = useState(1);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchRepos = () => {
    setLoading(true);
    setError(null);

    fetch("https://api.github.com/users/dondakhushi/repos")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch repositories");
        }
        return res.json();
      })
      .then((data) => {
        setRepos(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastRepo = currentPage * itemsPerPage;
  const indexOfFirstRepo = indexOfLastRepo - itemsPerPage;

  const currentRepos = filteredRepos.slice(
    indexOfFirstRepo,
    indexOfLastRepo
  );

  const totalPages = Math.ceil(filteredRepos.length / itemsPerPage);

  if (loading) return <Spinner />;

  if (error)
    return (
      <ErrorMessage
        message={error}
        onRetry={fetchRepos}
      />
    );

  return (
    <div className="projects">
      <h1>GitHub Repositories</h1>

      <input
        className="search-box"
        type="text"
        placeholder="Search Repository..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      <div className="repo-list">
        {currentRepos.length > 0 ? (
          currentRepos.map((repo) => (
            <div className="repo-card" key={repo.id}>
              <h3>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="repo-link"
                >
                  {repo.name}
                </a>
              </h3>

              <p>⭐ Stars: {repo.stargazers_count}</p>

              <p>
                {repo.description
                  ? repo.description
                  : "No description available"}
              </p>
            </div>
          ))
        ) : (
          <h2>No Repository Found</h2>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={currentPage === index + 1 ? "active" : ""}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Project;