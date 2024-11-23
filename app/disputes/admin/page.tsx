"use client";

import Card from "@/components/Card";
import DisputeCard from "@/components/DisputeCard";
import { CardContent, Typography, Button, Checkbox, Grid } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [disptueState, setDisputeState] = useState(true);

  const [disputes, setDisputed] = useState([
    { id: 1, ClinetName: "Zetsu", FreelancerName: "Manay", isResolved: false },
    { id: 2, ClinetName: "Zetsu", FreelancerName: "Manay", isResolved: false },
  ]);

  const handleCheckboxChange = (id: number) => {
    setDisputed(
      disputes.map((el) =>
        el.id === id ? { ...el, isResolved: !el.isResolved } : el
      )
    );
  };

  const ResolvedDisptued = [...disputes].filter((x) => x.isResolved);
  const NotResolvedDisptued = [...disputes].filter((x) => !x.isResolved);

  return (
    <div className="bg-gray-100 min-h-screen p-6 md:p-10">
      {/* Top Stats Cards */}
      <Grid container spacing={3} className="mb-10">
        {[
          {
            label: "Number of Disputes Created",
            value: "1,000",
            note: "25+ in the last 24 hours",
          },
          {
            label: "Completed Service Contracts",
            value: "950",
            note: "10+ in the last 24 hours",
          },
          { label: "Public / Private Contracts", value: "100/150" },
          { label: "Number of Bids Created", value: "2000" },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              className="bg-white leading-10 !shadow-sm hover:!shadow-lg !pb-0 !pt-1 !px-2 transition-all duration-300 !rounded-md min-h-[140px] sm:min-h-[160px]"
              width="2xl"
            >
              <CardContent>
                <Typography className="text-gray-500 !text-lg sm:!text-xl">
                  {stat.label}
                </Typography>
                <Typography className="text-green-600 !text-2xl sm:!text-3xl">
                  {stat.value}
                </Typography>
                {stat.note && (
                  <Typography className="text-sm text-gray-400">
                    {stat.note}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty Boxes (Total Users and Revenue) */}
      <Grid container spacing={3} className="mb-10">
        <Grid item xs={12} md={6}>
          <Card
            className="h-40 bg-white shadow-md min-h-[300px] !p-2"
            width="2xl"
          >
            <CardContent>
              <Typography variant="h6">
                Total number of registered users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            className="h-40 bg-white shadow-md min-h-[300px] !p-2"
            width="2xl"
          >
            <CardContent>
              <Typography variant="h6">Revenue Generated</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Open Disputes Section */}
      <Card className="bg-white p-4 shadow-md" width="2xl">
        <div className="flex gap-4 font-mynamarButton">
          <button
            className="disabled:text-black/30"
            disabled={disptueState}
            onClick={() => setDisputeState(true)}
          >
            Open Disputes
          </button>
          <button
            className="disabled:text-black/30"
            disabled={!disptueState}
            onClick={() => setDisputeState(false)}
          >
            Resolved Disputes
          </button>
        </div>
        <div className="overflow-x-auto mt-8">
          <div className="space-y-4">
            {!disptueState &&
              ResolvedDisptued.map((el, index) => (
                <div
                  key={index}
                  className={`flex justify-center sm:justify-between flex-col sm:flex-row gap-5 border-b border-textColor/50 pb-5`}
                >
                  <DisputeCard
                    title={el.ClinetName}
                    role="Client"
                    image={"imageLink"}
                    contactLink="#"
                  />

                  <DisputeCard
                    title={el.FreelancerName}
                    role="Freelancer"
                    image={"imageLink"}
                    contactLink="#"
                  />

                  <div className="text-sm text-center font-semibold">
                    <div className="text-textColor mb-6">Resolved</div>
                    <input
                      type="checkbox"
                      className="scale-[2]"
                      checked={el.isResolved}
                      onChange={() => handleCheckboxChange(el.id)}
                    />
                  </div>
                </div>
              ))}

            {disptueState &&
              NotResolvedDisptued.map((el, index) => (
                <div
                  key={index}
                  className={`flex justify-center sm:justify-between flex-col sm:flex-row gap-5 border-b border-textColor/50 pb-5`}
                >
                  <DisputeCard
                    title={el.ClinetName}
                    role="Client"
                    image={"imageLink"}
                    contactLink="#"
                  />

                  <DisputeCard
                    title={el.FreelancerName}
                    role="Freelancer"
                    image={"imageLink"}
                    contactLink="#"
                  />

                  <div className="text-sm text-center font-semibold">
                    <div className="text-textColor mb-6">Resolved</div>
                    <input
                      type="checkbox"
                      className="scale-[2]"
                      checked={el.isResolved}
                      onChange={() => handleCheckboxChange(el.id)}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
