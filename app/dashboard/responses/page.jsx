"use client";
import { db } from '@/configs';
import { jsonForms } from '@/configs/schema';
import { useUser } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import FormListItemResp from './_components/FormListItemResp';

function Responses() {
  const { user } = useUser();
  const [formList, setFormList] = useState([]);

  useEffect(() => {
    if (user) {
      getFormList();
    }
  }, [user]);

  const getFormList = async () => {
    try {
      const result = await db
        .select()
        .from(jsonForms)
        .where(eq(jsonForms.createdBy, user?.primaryEmailAddress?.emailAddress));

      setFormList(result);
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  };

  return (
    <div className="p-10">
      <h2 className="font-bold text-3xl flex items-center justify-between">Responses</h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {formList.map((form) => (
          <FormListItemResp
            key={form.id} // Added a unique key to resolve React warning
            formRecord={form}
            jsonForm={JSON.parse(form.jsonform)}
          />
        ))}
      </div>
    </div>
  );
}

export default Responses;
