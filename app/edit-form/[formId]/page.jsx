"use client";
import { db } from '@/configs';
import { jsonForms } from '@/configs/schema';
import { useUser } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
import { ArrowLeft, Share2, SquareArrowOutUpRight } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import FormUi from '../_components/FormUi';
import { toast } from 'sonner';
import Controller from '../_components/Controller';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RWebShare } from 'react-web-share';

function EditForm() {
  const { user } = useUser();
  const params = useParams();
  const [jsonForm, setJsonForm] = useState([]);
  const router = useRouter();
  const [updateTrigger, setUpdateTrigger] = useState();
  const [record, setRecord] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [selectedBackground, setSelectedBackground] = useState();
  const [selectedStyle, setSelectedStyle] = useState();

  useEffect(() => {
    if (user && params?.formId) {
      GetFormData();
    }
  }, [user, params?.formId]);

  const GetFormData = async () => {
    try {
      const result = await db
        .select()
        .from(jsonForms)
        .where(
          and(
            eq(jsonForms.id, params.formId),
            eq(jsonForms.createdBy, user?.primaryEmailAddress?.emailAddress)
          )
        );

      if (result.length > 0) {
        setRecord(result[0]);
        setJsonForm(JSON.parse(result[0].jsonform));
        setSelectedBackground(result[0].background);
        setSelectedTheme(result[0].theme);
        setSelectedStyle(JSON.parse(result[0].style));
      }
    } catch (error) {
      console.error("Error fetching form data", error);
    }
  };

  const onFieldUpdate = (value, index) => {
    jsonForm.fields[index].label = value.label;
    jsonForm.fields[index].placeholder = value.placeholder;
    setUpdateTrigger(Date.now());
  };

  const updateJsonFormInDb = async () => {
    try {
      await db
        .update(jsonForms)
        .set({ jsonform: jsonForm })
        .where(
          and(
            eq(jsonForms.id, record.id),
            eq(jsonForms.createdBy, user?.primaryEmailAddress?.emailAddress)
          )
        )
        .returning({ id: jsonForms.id });

      toast('Updated!!!');
    } catch (error) {
      console.error('Error updating form data', error);
      toast('Error updating form');
    }
  };

  const deleteField = (indexToRemove) => {
    const result = jsonForm.fields.filter((item, index) => index !== indexToRemove);
    jsonForm.fields = result;
    setUpdateTrigger(Date.now());
  };

  const updateControllerFields = async (value, columnName) => {
    try {
      await db
        .update(jsonForms)
        .set({ [columnName]: value })
        .where(
          and(
            eq(jsonForms.id, record.id),
            eq(jsonForms.createdBy, user?.primaryEmailAddress?.emailAddress)
          )
        )
        .returning({ id: jsonForms.id });

      toast('Updated!!!');
    } catch (error) {
      console.error('Error updating controller fields', error);
      toast('Error updating controller fields');
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return (
    <div className="p-10">
      <div className="flex justify-between items-center">
        <h2
          className="flex gap-2 items-center my-5 cursor-pointer hover:font-bold"
          onClick={() => router.back()}
        >
          <ArrowLeft /> Back
        </h2>
        <div className="flex gap-2">
          {/* Dynamic route link for live preview */}
          <Link href={`/aiform/${record?.id}`} target="_blank">
            <Button className="flex gap-2">
              <SquareArrowOutUpRight className="h-5 w-5" /> Live Preview
            </Button>
          </Link>
          <RWebShare
            data={{
              text: `${jsonForm?.formHeading}, Build your form in seconds with AI form Builder`,
              url: `${baseUrl}/aiform/${record?.id}`,
              title: jsonForm?.formTitle,
            }}
            onClick={() => console.log('shared successfully!')}
          >
            <Button className="flex gap-2 bg-green-600 hover:bg-green-700">
              <Share2 /> Share
            </Button>
          </RWebShare>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 border rounded-lg shadow-md">
          <Controller
            selectedTheme={(value) => {
              updateControllerFields(value, 'theme');
              setSelectedTheme(value);
            }}
            selectedBackground={(value) => {
              updateControllerFields(value, 'background');
              setSelectedBackground(value);
            }}
            selectedStyle={(value) => {
              setSelectedStyle(value);
              updateControllerFields(value, 'style');
            }}
            setSignInEnable={(value) => {
              updateControllerFields(value, 'enabledSignIn');
            }}
          />
        </div>
        <div
          className="md:col-span-2 border rounded-lg p-5 flex items-center justify-center"
          style={{
            backgroundImage: selectedBackground,
          }}
        >
          <FormUi
            jsonForm={jsonForm}
            selectedTheme={selectedTheme}
            selectedStyle={selectedStyle}
            onFieldUpdate={onFieldUpdate}
            deleteField={(index) => deleteField(index)}
          />
        </div>
      </div>
    </div>
  );
}

export default EditForm;
