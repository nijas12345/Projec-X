import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/RootState/RootState";
import { UserData } from "../apiTypes/apiTypes";
import LeftNavBar from "../components/user-left-nav";

type TimeEntry = {
  _id: string;
  clockIn: string;
  clockOut: string;
  workDuration: number;
  breakDuration: number;
  date: string;
  isClockedIn: boolean;
  isOnBreak: boolean;
  user_id: string;
};

export default function TimeTrackingTable() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isClockingIn, setIsClockingIn] = useState<boolean>(true);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const navigate = useNavigate();
  const userInfo = useSelector(
    (state: RootState): UserData | null => state.userAuth.userInfo
  );

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await api.get("/clock-statistics", {
          headers: { "Content-Type": "application/json" },
        });
        setEntries(response.data);
      } catch (error: any) {
        console.error("Error fetching time entries:", error.message || error);
      }
    };

    fetchEntries();
  }, []);

  useEffect(() => {
    const total = entries.reduce(
      (acc, entry) => acc + (entry.workDuration || 0),
      0
    );
    setTotalHours(Math.floor(total / 3600000));
    setTotalMinutes(Math.floor((total % 3600000) / 60000));
  }, [entries]);

  const formatDate = (date: string) => {
    return date
      ? new Date(date).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "Not clocked out";
  };

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{ width: "4%", minHeight: "100vh", backgroundColor: "#2d3748" }}
      >
        <LeftNavBar />
      </div>
      <div
        style={{
          width: "90%",
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "auto" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "2rem",
              color: "#2d3748",
            }}
          >
            Employee Time Tracker
          </h1>
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              padding: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Time Entries
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.5rem",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Clock In
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.5rem",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Clock Out
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.5rem",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Break Duration
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.5rem",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Work Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const hours = Math.floor(entry.workDuration / 3600000);
                  const minutes = Math.floor(
                    (entry.workDuration % 3600000) / 60000
                  );
                  const hour = Math.floor(entry.breakDuration / 3600000);
                  const minute = Math.floor(
                    (entry.breakDuration % 3600000) / 60000
                  );
                  return (
                    <tr key={entry._id}>
                      <td
                        style={{
                          padding: "0.5rem",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        {formatDate(entry.date)}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        {formatDate(entry.clockOut)}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        {entry.breakDuration
                          ? `${hour} hours ${minute} minutes`
                          : "No Break Time"}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        {entry.workDuration
                          ? `${hours} hours ${minutes} minutes`
                          : "In progress"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
