
"use client";

import { useEffect, useState } from "react";

export default function ActiveMemberCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch("/api/public/stats", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to fetch member count.");
        }

        const data = await response.json();
        setCount(data.activeMembers);
      } catch (error) {
        console.error(error);
      }
    }

    fetchCount();

    // Refresh the count every 60 seconds.
    const interval = setInterval(fetchCount, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <strong>
        {count === null ? "--" : count.toLocaleString("en-IN")}
      </strong>
      <span>Active Members</span>
    </div>
  );
}
