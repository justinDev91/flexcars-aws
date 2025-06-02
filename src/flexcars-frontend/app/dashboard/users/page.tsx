"use client";

import LeadGrid from "./components/LeadGrid";
import { UsersStack } from "./components/UsersStack";

export default function Users() {

  return (
    <div >
      <div className="pb-8">
        <LeadGrid />
      </div>
      <div>
        <UsersStack />
      </div>
    </div>
  );
}
