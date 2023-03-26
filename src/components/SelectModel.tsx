import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  HamburgerMenuIcon,
  DotFilledIcon,
  CheckIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons';

export default function SelectModel({ setChatModel, model, loading }: { model: string, loading: string, setChatModel: (text: string) => void }) {

  return (
    <DropdownMenu.Root>
      <DropdownMenu.DropdownMenuTrigger>
        <div className=" text-2xl p-1 font-bold flex justify-center items-center rounded-bg">Chat with <div className="bg-gray-600 mx-1 p-1 rounded-lg"> {model} </div> <div
          className={`rounded-full ml-4 p-1 w-32 h-11 flex items-center justify-center text-lg text-white ${loading == "Loading" ? 'bg-yellow-500' : loading == "Awaiting Input" ? 'bg-green-500' : 'bg-red-500'
            }`}
        >
          {loading}
        </div> 
        </div>


      </DropdownMenu.DropdownMenuTrigger>

      <DropdownMenu.Content className="rounded-lg bg-gray-600 p-2">


        <DropdownMenu.RadioGroup value={model}  onValueChange={setChatModel}>
          <DropdownMenu.RadioItem value="GPT-4">

            GPT-4
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="GPT-3.5-turbo">

            GPT-3.5-turbo
          </DropdownMenu.RadioItem>
          {/* <DropdownMenu.RadioItem value="Code-Davinci-002">

            Code-Davinci-002
          </DropdownMenu.RadioItem> */}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>

  );
}