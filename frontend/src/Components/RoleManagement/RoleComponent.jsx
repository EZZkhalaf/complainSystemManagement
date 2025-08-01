import React, { Fragment, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { fetchRolesHook } from '../../utils/RolesHelper';
import { useNavigate } from 'react-router-dom';

const RoleComponent = ({roles , setAddEmployee}) => {
     const navigate = useNavigate();

     const deleteRole = async(roleId) => {
        console.log(roleId)
     }

  return (
    <div className="p-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {roles.map((role, index) => (
        <div
          key={role._id}
          className="relative bg-white shadow-md rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-shadow"
        >
          {/* 3 dots menu */}
          <Menu as="div" className="absolute top-2 right-2 text-right z-10">
            <Menu.Button className="p-1 text-gray-600 hover:text-blue-600 rounded-full">
              <BsThreeDotsVertical className="w-5 h-5" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate(`/adminPage/manageRoles/role/adduser/${role._id}`)}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          active ? 'bg-blue-100 text-blue-800' : 'text-gray-800'
                        }`}
                      >
                        Assign User
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`w-full text-left px-4 py-2 text-sm ${
                          active ? 'bg-blue-100 text-blue-800' : 'text-gray-800'
                        }`}
                      >
                        Assign Groups
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate(`/adminPage/manageRoles/role/addPermission/${role._id}`)}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          active ? 'bg-blue-100 text-blue-800' : 'text-gray-800'
                        }`}
                      >
                        Assign Permission
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => deleteRole(role._id)}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          active ? 'bg-blue-100 text-blue-800' : 'text-gray-800'
                        }`}
                      >
                        Delete Role
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Role Info */}
          <h2 className="text-xl font-semibold text-blue-800 mb-2">{role.role}</h2>
          <p className="text-gray-600">
            Number of Employees: <span className="font-medium">{role.user.length}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default RoleComponent;
