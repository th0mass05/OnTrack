import "./App.css";

type Chore = {
  id: number;
  name: string;
  assignee: string;
  due: string;
  xp: number;
  completed: boolean;
};

type HouseMember = {
  id: number;
  name: string;
  initials: string;
  xp: number;
  streak: number;
};

type HouseEvent = {
  id: number;
  title: string;
  date: string;
  type: string;
};

type ActivityItem = {
  id: number;
  user: string;
  action: string;
  xp?: number;
  time: string;
};

function App() {
  const chores: Chore[] = [
    {
      id: 1,
      name: "Clean the kitchen",
      assignee: "Tom",
      due: "Today",
      xp: 30,
      completed: false,
    },
    {
      id: 2,
      name: "Take the bins out",
      assignee: "Jack",
      due: "Tonight",
      xp: 10,
      completed: false,
    },
    {
      id: 3,
      name: "Clean the bathroom",
      assignee: "Ben",
      due: "Tomorrow",
      xp: 40,
      completed: false,
    },
    {
      id: 4,
      name: "Vacuum downstairs",
      assignee: "Ed",
      due: "Friday",
      xp: 20,
      completed: true,
    },
  ];

  const members: HouseMember[] = [
    {
      id: 1,
      name: "Tom",
      initials: "TC",
      xp: 425,
      streak: 7,
    },
    {
      id: 2,
      name: "Jack",
      initials: "JK",
      xp: 380,
      streak: 3,
    },
    {
      id: 3,
      name: "Ben",
      initials: "BN",
      xp: 330,
      streak: 4,
    },
    {
      id: 4,
      name: "Ed",
      initials: "ED",
      xp: 295,
      streak: 2,
    },
  ];

  const events: HouseEvent[] = [
    {
      id: 1,
      title: "House dinner",
      date: "Fri 9 Oct",
      type: "Food",
    },
    {
      id: 2,
      title: "Pub quiz",
      date: "Tue 13 Oct",
      type: "Social",
    },
    {
      id: 3,
      title: "Rent due",
      date: "Thu 15 Oct",
      type: "House",
    },
  ];

  const activity: ActivityItem[] = [
    {
      id: 1,
      user: "Tom",
      action: "completed Clean Kitchen",
      xp: 30,
      time: "20 mins ago",
    },
    {
      id: 2,
      user: "Jack",
      action: "created House Dinner",
      time: "1 hour ago",
    },
    {
      id: 3,
      user: "Ben",
      action: "reached Level 6",
      time: "Yesterday",
    },
    {
      id: 4,
      user: "Ed",
      action: "completed Vacuum Downstairs",
      xp: 20,
      time: "Yesterday",
    },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>

          <div>
            <h2>Common</h2>
            <p>Run your house together.</p>
          </div>
        </div>

        <nav className="nav">
          <button className="nav-item active">
            <i className="bi bi-house-door"></i>
            Home
          </button>

          <button className="nav-item active">
            <i className="bi bi-list-check"></i>
            Chores
          </button>

          <button className="nav-item active">
            <i className="bi bi-calendar"></i>
            Calendar
          </button>

          <button className="nav-item active">
            <i className="bi bi-graph-up"></i>
            Stats
          </button>

          <button className="nav-item active">
            <i className="bi bi-people"></i>
            Members
          </button>

          <button className="nav-item active">
            <i className="bi bi-trophy"></i>
            Leaderboard
          </button>
        </nav>

        <div className="modules">
          <p className="sidebar-label">HOUSE MODULES</p>

          <button className="nav-item">
            <span>☷</span>
            Shopping
          </button>

          <button className="nav-item">
            <span>?</span>
            Polls
          </button>

          <button className="nav-item">
            <span>＋</span>
            Add module
          </button>
        </div>

        <div className="house-profile">
          <div className="house-avatar">22</div>

          <div>
            <strong>22 Chamberlain Rd</strong>
            <p>4 housemates</p>
          </div>

          <button className="settings-button">•••</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">MONDAY, 5 OCTOBER</p>

            <h1>
              Good morning, Tom <span>👋</span>
            </h1>

            <p className="subtitle">
              Here&apos;s what&apos;s happening at 22 Chamberlain Road.
            </p>
          </div>

          <div className="top-actions">
            <button className="secondary-button">
              Invite housemate
            </button>

            <button className="primary-button">
              + Add chore
            </button>
          </div>
        </header>

        <section className="house-level-card">
          <div>
            <p className="eyebrow light">HOUSE LEVEL</p>

            <div className="level-heading">
              <h2>Level 8</h2>
              <span>🔥 7 day streak</span>
            </div>

            <div className="house-progress">
              <div
                className="house-progress-fill"
                style={{ width: "82%" }}
              />
            </div>

            <div className="house-progress-labels">
              <span>742 XP</span>
              <span>900 XP</span>
            </div>
          </div>

          <div className="level-summary">
            <span className="level-number">82%</span>
            <span>weekly completion</span>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-main">
            <section className="card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">THIS WEEK</p>
                  <h2>House chores</h2>
                </div>

                <button className="text-button">
                  View all
                </button>
              </div>

              <div className="chore-list">
                {chores.map((chore) => (
                  <div
                    className={`chore-row ${
                      chore.completed ? "completed" : ""
                    }`}
                    key={chore.id}
                  >
                    <button
                      className={`chore-checkbox ${
                        chore.completed ? "checked" : ""
                      }`}
                      aria-label={`Complete ${chore.name}`}
                    >
                      {chore.completed ? "✓" : ""}
                    </button>

                    <div className="chore-details">
                      <h3>{chore.name}</h3>

                      <div className="chore-subtext">
                        <span>{chore.assignee}</span>
                        <span>•</span>
                        <span>Due {chore.due}</span>
                      </div>
                    </div>

                    

                    <div className="xp-pill">
                      +{chore.xp} XP
                    </div>
                  </div>
                ))}
              </div>

              <button className="full-width-button">
                + Create a chore
              </button>
            </section>

            <section className="card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">HOUSE ACTIVITY</p>
                  <h2>What&apos;s been happening</h2>
                </div>
              </div>

              <div className="activity-list">
                {activity.map((item) => (
                  <div
                    className="activity-row"
                    key={item.id}
                  >
                    <div className="activity-icon">
                      {item.user.charAt(0)}
                    </div>

                    <div className="activity-content">
                      <p>
                        <strong>{item.user}</strong>{" "}
                        {item.action}
                      </p>

                      <span>{item.time}</span>
                    </div>

                    {item.xp && (
                      <span className="activity-xp">
                        +{item.xp} XP
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="dashboard-sidebar">
            <section className="card leaderboard-card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">THIS WEEK</p>
                  <h2>Leaderboard</h2>
                </div>

                <span className="trophy">🏆</span>
              </div>

              <div className="leaderboard">
                {members.map((member, index) => (
                  <div
                    className="leaderboard-row"
                    key={member.id}
                  >
                    <span className="rank">
                      {index + 1}
                    </span>

                    <div className="member-avatar">
                      {member.initials}
                    </div>

                    <div className="member-details">
                      <strong>{member.name}</strong>
                      <span>
                        🔥 {member.streak} day streak
                      </span>
                    </div>

                    <strong className="member-xp">
                      {member.xp} XP
                    </strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">UPCOMING</p>
                  <h2>House calendar</h2>
                </div>

                <button className="text-button">
                  View
                </button>
              </div>

              <div className="event-list">
                {events.map((event) => (
                  <div
                    className="event-row"
                    key={event.id}
                  >
                    <div className="event-date">
                      <strong>
                        {event.date.split(" ")[1]}
                      </strong>
                      <span>
                        {event.date.split(" ")[0]}
                      </span>
                    </div>

                    <div>
                      <strong>{event.title}</strong>
                      <p>{event.type}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="full-width-button">
                + Add event
              </button>
            </section>

            <section className="wrapped-card">
              <div>
                <span className="wrapped-badge">
                  COMING SOON
                </span>

                <h2>House Wrapped</h2>

                <p>
                  Your chores, chaos, memories and
                  questionable statistics.
                </p>

                <button>Preview Wrapped →</button>
              </div>

              <div className="wrapped-decoration">
                2026
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;