import type { SVGProps } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as Tabs from '@radix-ui/react-tabs'
import { useState } from 'react'
import { api } from '@/utils/client/api'
import { useAutoAnimate } from '@formkit/auto-animate/react'

/**
 * QUESTION 3:
 * -----------
 * A todo has 2 statuses: "pending" and "completed"
 *  - "pending" state is represented by an unchecked checkbox
 *  - "completed" state is represented by a checked checkbox, darker background,
 *    and a line-through text
 *
 * We have 2 backend apis:
 *  - (1) `api.todo.getAll`       -> a query to get all todos
 *  - (2) `api.todoStatus.update` -> a mutation to update a todo's status
 *
 * Example usage for (1) is right below inside the TodoList component. For (2),
 * you can find similar usage (`api.todo.create`) in src/client/components/CreateTodoForm.tsx
 *
 * If you use VSCode as your editor , you should have intellisense for the apis'
 * input. If not, you can find their signatures in:
 *  - (1) src/server/api/routers/todo-router.ts
 *  - (2) src/server/api/routers/todo-status-router.ts
 *
 * Your tasks are:
 *  - Use TRPC to connect the todos' statuses to the backend apis
 *  - Style each todo item to reflect its status base on the design on Figma
 *
 * Documentation references:
 *  - https://trpc.io/docs/client/react/useQuery
 *  - https://trpc.io/docs/client/react/useMutation
 *
 *
 *
 *
 *
 * QUESTION 4:
 * -----------
 * Implement UI to delete a todo. The UI should look like the design on Figma
 *
 * The backend api to delete a todo is `api.todo.delete`. You can find the api
 * signature in src/server/api/routers/todo-router.ts
 *
 * NOTES:
 *  - Use the XMarkIcon component below for the delete icon button. Note that
 *  the icon button should be accessible
 *  - deleted todo should be removed from the UI without page refresh
 *
 * Documentation references:
 *  - https://www.sarasoueidan.com/blog/accessible-icon-buttons
 *
 *
 *
 *
 *
 * QUESTION 5:
 * -----------
 * Animate your todo list using @formkit/auto-animate package
 *
 * Documentation references:
 *  - https://auto-animate.formkit.com
 */

export const TodoList = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>(
    'all'
  )

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'all' | 'pending' | 'completed')
  }

  const { data: todos = [], refetch: refetchTodos } = api.todo.getAll.useQuery({
    statuses: activeTab === 'all' ? ['completed', 'pending'] : [activeTab],
  })

  const { mutate: updateTodoStatus } = api.todoStatus.update.useMutation({
    onSuccess: () => {
      refetchTodos()
    },
  })

  const handleCheckboxChange = (
    todoId: number,
    status: 'completed' | 'pending'
  ) => {
    updateTodoStatus({
      todoId,
      status: status === 'completed' ? 'pending' : 'completed',
    })
  }

  const { mutate: deleteTodo } = api.todo.delete.useMutation({
    onSuccess: () => {
      refetchTodos()
    },
  })

  const handleDelete = (todoId: number) => {
    deleteTodo({ id: todoId })
  }

  const [animate] = useAutoAnimate<HTMLUListElement>()

  return (
    <div>
      <Tabs.Root
        className="flex w-full"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <Tabs.List className="flex w-full pb-9">
          <Tabs.Trigger
            className={`mr-2 rounded-full border-2 px-4 py-2 focus:outline-none data-[state=active]:border-b-2 data-[state=active]:border-gray-700 data-[state=active]:font-medium ${
              activeTab === 'all'
                ? 'border-gray-700 bg-gray-700 font-medium text-white'
                : 'border-gray-200 text-gray-500 hover:border-gray-500 hover:text-gray-700'
            }`}
            value="all"
          >
            All
          </Tabs.Trigger>
          <Tabs.Trigger
            className={`mr-2 rounded-full border-2 px-4 py-2 focus:outline-none data-[state=active]:border-b-2 data-[state=active]:border-gray-700 data-[state=active]:font-medium ${
              activeTab === 'pending'
                ? 'border-gray-700 bg-gray-700 font-medium text-white'
                : 'border-gray-200 text-gray-500 hover:border-gray-500 hover:text-gray-700'
            }`}
            value="pending"
          >
            Pending
          </Tabs.Trigger>
          <Tabs.Trigger
            className={`mr-2 rounded-full border-2 px-4 py-2 focus:outline-none data-[state=active]:border-b-2 data-[state=active]:border-gray-700 data-[state=active]:font-medium ${
              activeTab === 'completed'
                ? 'border-gray-700 bg-gray-700 font-medium text-white'
                : 'border-gray-200 text-gray-500 hover:border-gray-500 hover:text-gray-700'
            }`}
            value="completed"
          >
            Completed
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      <ul ref={animate} className="grid grid-cols-1 gap-y-3">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`rounded-12 border px-4 py-3 shadow-sm ${
              todo.status === 'completed'
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox.Root
                  id={String(todo.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                  checked={todo.status === 'completed'}
                  onCheckedChange={() =>
                    handleCheckboxChange(todo.id, todo.status)
                  }
                >
                  <Checkbox.Indicator>
                    <CheckIcon className="h-4 w-4 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>

                <label
                  className={`block pl-3 font-medium ${
                    todo.status === 'completed'
                      ? 'text-gray-400 line-through'
                      : ''
                  }`}
                  htmlFor={String(todo.id)}
                >
                  {todo.body}
                </label>
              </div>

              <button
                className="grid justify-items-end rounded-full p-2 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none"
                onClick={() => handleDelete(todo.id)}
                aria-label="Delete todo"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const XMarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

const CheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}
