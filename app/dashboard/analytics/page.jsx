"use client";
import { db } from '@/configs';
import { jsonForms, userResponses } from '@/configs/schema';
import { useUser } from '@clerk/nextjs';
import { eq, inArray } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Bar } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,  // <-- Register the LinearScale
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,   // <-- Ensure LinearScale is registered
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);


function Analytics() {
  const { user } = useUser();
  const [totalForms, setTotalForms] = useState(0);
  const [totalResponses, setTotalResponses] = useState(0);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch all forms created by the user
      const forms = await db
        .select()
        .from(jsonForms)
        .where(eq(jsonForms.createdBy, user?.primaryEmailAddress?.emailAddress));

      setTotalForms(forms.length);

      // Fetch all responses for these forms
      const formIds = forms.map((form) => form.id);

      // Use inArray() to filter the responses for these formIds
      const responses = await db
        .select()
        .from(userResponses)
        .where(inArray(userResponses.formRef, formIds)); // Correct usage of inArray

      setTotalResponses(responses.length);

      // Prepare chart data
      const formResponseCounts = forms.map((form) => {
        const count = responses.filter((res) => res.formRef === form.id).length;
        return { formTitle: JSON.parse(form.jsonform).formTitle, count };
      });

      setChartData({
        labels: formResponseCounts.map((item) => item.formTitle),
        datasets: [
          {
            label: 'Responses per Form',
            data: formResponseCounts.map((item) => item.count),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  const exportAnalyticsData = () => {
    const data = [
      { Metric: 'Total Forms', Value: totalForms },
      { Metric: 'Total Responses', Value: totalResponses },
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics');
    XLSX.writeFile(workbook, 'analytics_data.xlsx');
  };

  return (
    <div className="p-10">
      <h2 className="font-bold text-3xl mb-5">Analytics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="border shadow-sm rounded-lg p-4">
          <h3 className="text-lg font-semibold">Total Forms</h3>
          <p className="text-2xl">{totalForms}</p>
        </div>
        <div className="border shadow-sm rounded-lg p-4">
          <h3 className="text-lg font-semibold">Total Responses</h3>
          <p className="text-2xl">{totalResponses}</p>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="font-bold text-2xl mb-4">Responses Overview</h3>
        {chartData.labels && chartData.labels.length > 0 ? (
          <Bar data={chartData} />
        ) : (
          <p>No data available for charts.</p>
        )}
      </div>

      <div className="mt-10">
        <Button onClick={exportAnalyticsData}>Export Analytics Data</Button>
      </div>
    </div>
  );
}

export default Analytics;
