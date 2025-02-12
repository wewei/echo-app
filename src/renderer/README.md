# Renderer Guidelines

## File naming conventions
### React components
1. Use PascalCase for component names
2. Put all the components in the `/components` folder
3. Container/Representational separation is required
4. For simple stateless component, the file name should be `MyComponent.tsx`
5. For components with state or complex state component that may have one or more sub components, create a folder `MyComponent` for it, and export the component from `index.ts`
6. For components with state
   * Put all the layout and styles in the representational component, name it as `MyComponentRp.tsx`, it should be stateless
   * Put all the logic and state in the container component, name it as `MyComponentCt.tsx`. The container component should be a simple wrapper of the representational component, filling all the props. It should look like
      ```tsx
      import MyComponentRp from './MyComponentRp'

      export default function MyComponentCt({ props }: Props) {
        const [stateFoo, setStateFoo] = useState(initialStateFoo)
        const [stateBar, setStateBar] = useState(initialStateBar)
        const handleEventA = useCallback(() => {
          // handle event A
        }, [/* dependencies */])
        const handleEventB = useCallback(() => {
          // handle event B
        }, [/* dependencies */])
        return <MyComponentRp foo={stateFoo} bar={stateBar} onEventA={handleEventA} onEventB={handleEventB} />
      }
      ```
### None component modules
1. Use camelCase for module names
2. Put all the data access hooks in the `/data` folder
